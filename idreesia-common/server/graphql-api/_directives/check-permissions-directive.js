/* eslint "no-param-reassign": "off" */

import { SchemaDirectiveVisitor } from 'apollo-server-express';
import { defaultFieldResolver } from 'graphql';

import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default class CheckPermissionsDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { permissions } = this.args;

    field.resolve = async (...args) => {
      const [, , context, info] = args;
      const { user } = context;

      const permissionValues = permissions.map(permission => {
        const permissionValue = PermissionConstants[permission];
        if (!permissionValue) {
          throw new Error(
            `Invalid permission ${permission} specified for ${info.fieldName}`
          );
        }

        return permissionValue;
      });

      if (!hasOnePermission(user._id, permissionValues)) {
        if (info.parentType.name === 'Query') {
          if (info.fieldName.startsWith('paged')) {
            return {
              data: [],
              totalResults: 0,
            };
          }

          return null;
        }

        // It is a mutation, throw a not-allowed exception
        throw new Error(
          `You do not have required permissions for this operation.`
        );
      }

      const result = await resolve.apply(this, args);
      return result;
    };
  }
}
