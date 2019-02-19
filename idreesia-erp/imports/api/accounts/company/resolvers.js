import { Companies } from "meteor/idreesia-common/collections/accounts";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  Query: {
    allCompanies(obj, params, { userId }) {
      if (
        !hasOnePermission(userId, [PermissionConstants.ADMIN_VIEW_COMPANIES])
      ) {
        throw new Error(
          "You do not have permission to view Companies in the System."
        );
      }

      return Companies.find({}).fetch();
    },

    companyById(obj, { id }, { userId }) {
      if (
        !hasOnePermission(userId, [PermissionConstants.ADMIN_VIEW_COMPANIES])
      ) {
        throw new Error(
          "You do not have permission to view Companies in the System."
        );
      }

      return Companies.findOne(id);
    },
  },

  Mutation: {
    createCompany(obj, { name, importData, connectivitySettings }, { userId }) {
      if (
        !hasOnePermission(userId, [PermissionConstants.ADMIN_MANAGE_COMPANIES])
      ) {
        throw new Error(
          "You do not have permission to manage Companies in the System."
        );
      }

      const date = new Date();
      const accountId = Companies.insert({
        name,
        importData,
        connectivitySettings,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
      });

      return Companies.findOne(accountId);
    },

    updateCompany(
      obj,
      { _id, name, importData, connectivitySettings },
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [PermissionConstants.ADMIN_MANAGE_COMPANIES])
      ) {
        throw new Error(
          "You do not have permission to manage Companies in the System."
        );
      }

      const date = new Date();
      Companies.update(_id, {
        $set: {
          name,
          importData,
          connectivitySettings,
          updatedAt: date,
          updatedBy: userId,
        },
      });

      return Companies.findOne(_id);
    },
  },
};
