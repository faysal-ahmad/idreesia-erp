import {
  Companies,
  DataImports,
} from "meteor/idreesia-common/collections/accounts";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";
import { createJob } from "meteor/idreesia-common/utilities/jobs";

import getDataImports from "./queries";

export default {
  DataImport: {
    refCompany: dataImport =>
      Companies.findOne({
        _id: { $eq: dataImport.companyId },
      }),
  },

  Query: {
    pagedDataImports(obj, { companyId, pageIndex, pageSize }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ACCOUNTS_IMPORT_DATA])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getDataImports(companyId, pageIndex, pageSize);
    },
  },

  Mutation: {
    createDataImport(obj, { companyId, importType, importForMonth }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ACCOUNTS_IMPORT_DATA])
      ) {
        throw new Error(
          "You do not have permission to import data for Companies in the System."
        );
      }

      const date = new Date();
      const dataImportId = DataImports.insert({
        companyId,
        importType,
        importForMonth,
        status: "queued",
        logs: [],
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      createJob({
        type: "IMPORT_DATA",
        params: { dataImportId },
        options: { priority: "normal", retry: 10 },
      });
      return DataImports.findOne(dataImportId);
    },

    removeDataImport(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ACCOUNTS_IMPORT_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage imports for Companies in the System."
        );
      }

      return DataImports.remove(_id);
    },
  },
};
