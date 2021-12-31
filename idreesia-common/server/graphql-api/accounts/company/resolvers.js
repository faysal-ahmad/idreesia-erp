import { Companies } from 'meteor/idreesia-common/server/collections/accounts';
import {
  filterByInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    allCompanies(obj, params, { user }) {
      if (
        !hasOnePermission(user, [
          PermissionConstants.ADMIN_VIEW_COMPANIES,
          PermissionConstants.ADMIN_MANAGE_COMPANIES,
        ])
      ) {
        return [];
      }

      return Companies.find({}).fetch();
    },

    allAccessibleCompanies(obj, params, { user }) {
      const companies = Companies.find({}).fetch();
      const filteredCompanies = filterByInstanceAccess(user, companies);
      return filteredCompanies;
    },

    companyById(obj, { id }, { user }) {
      if (
        !hasOnePermission(user, [
          PermissionConstants.ADMIN_VIEW_COMPANIES,
          PermissionConstants.ADMIN_MANAGE_COMPANIES,
        ])
      ) {
        return null;
      }

      return Companies.findOne(id);
    },
  },

  Mutation: {
    createCompany(obj, { name, importData, connectivitySettings }, { user }) {
      if (
        !hasOnePermission(user, [PermissionConstants.ADMIN_MANAGE_COMPANIES])
      ) {
        throw new Error(
          'You do not have permission to manage Companies in the System.'
        );
      }

      const date = new Date();
      const companyId = Companies.insert({
        name,
        importData,
        connectivitySettings,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Companies.findOne(companyId);
    },

    updateCompany(
      obj,
      { _id, name, importData, connectivitySettings },
      { user }
    ) {
      if (
        !hasOnePermission(user, [PermissionConstants.ADMIN_MANAGE_COMPANIES])
      ) {
        throw new Error(
          'You do not have permission to manage Companies in the System.'
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
