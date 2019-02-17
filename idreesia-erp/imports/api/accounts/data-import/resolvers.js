import { DataImports } from "meteor/idreesia-common/collections/accounts";
import { hasInstanceAccess, hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";
import { createJob } from "meteor/idreesia-common/utilities/jobs";

import getDataImports from "./queries";

export default {
  Query: {
    pagedDataImports(obj, { companyId, pageIndex, pageSize }, { userId }) {
      if (
        hasInstanceAccess(userId, companyId) === false ||
        !hasOnePermission(userId, [PermissionConstants.ADMIN_MANAGE_COMPANIES])
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
    createDataImport(obj, { companyId }, { userId }) {
      if (
        hasInstanceAccess(userId, companyId) === false ||
        !hasOnePermission(userId, [PermissionConstants.ADMIN_MANAGE_COMPANIES])
      ) {
        throw new Error(
          "You do not have permission to import data for Companies in the System."
        );
      }

      const date = new Date();
      const dataImportId = DataImports.insert({
        companyId,
        status: "queued",
        logs: [],
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
      });

      createJob({
        type: "IMPORT_DATA",
        params: { dataImportId },
        options: { priority: "normal", retry: 10 },
      });
      return DataImports.findOne(dataImportId);
    },
  },
};
