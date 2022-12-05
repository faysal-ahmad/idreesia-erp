/* eslint-disable no-param-reassign */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver } from 'graphql';

import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default function CheckPermissionsDirective(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: fieldConfig => {
      const directive = getDirective(
        schema,
        fieldConfig,
        'checkPermissions'
      )?.[0];
      if (directive) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        const { permissions, dataFieldName = 'data' } = directive;

        fieldConfig.resolve = async (...params) => {
          const [, , context, info] = params;
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

          if (hasOnePermission(user, permissionValues) === false) {
            if (info.parentType.name === 'Query') {
              if (info.fieldName.startsWith('paged')) {
                return {
                  [dataFieldName]: [],
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

          const result = await resolve.apply(this, params);
          return result;
        };
      }

      return fieldConfig;
    },
  });
}
