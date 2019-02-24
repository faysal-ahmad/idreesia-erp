import { Companies } from "meteor/idreesia-common/collections/accounts";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  Query: {
    allCompanies(obj, params, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_VIEW_COMPANIES])
      ) {
        return [];
      }

      return Companies.find({}).fetch();
    },

    companyById(obj, { id }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_VIEW_COMPANIES])
      ) {
        return null;
      }

      return Companies.findOne(id);
    },
  },

  Mutation: {
    createCompany(obj, { name, importData, connectivitySettings }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_MANAGE_COMPANIES])
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
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Companies.findOne(accountId);
    },

    updateCompany(
      obj,
      { _id, name, importData, connectivitySettings },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.ADMIN_MANAGE_COMPANIES])
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
          updatedBy: user._id,
        },
      });

      return Companies.findOne(_id);
    },
  },
};
