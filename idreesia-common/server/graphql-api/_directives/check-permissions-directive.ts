/* eslint-disable no-param-reassign */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver } from 'graphql';
import type {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
} from 'graphql';

import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

type DirectiveSchema = Parameters<typeof mapSchema>[0];

interface ResolverContext {
  user?: Parameters<typeof hasOnePermission>[0];
}

interface CheckPermissionsDirectiveArgs {
  permissions?: string[];
  dataFieldName?: string;
}

export default function CheckPermissionsDirective(schema: DirectiveSchema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (
      fieldConfig: GraphQLFieldConfig<unknown, ResolverContext>
    ) => {
      const directive = getDirective(
        schema,
        fieldConfig,
        'checkPermissions'
      )?.[0] as CheckPermissionsDirectiveArgs | undefined;
      if (directive) {
        const resolve = (fieldConfig.resolve ??
          defaultFieldResolver) as GraphQLFieldResolver<
          unknown,
          ResolverContext
        >;
        const { permissions = [], dataFieldName = 'data' } = directive;

        fieldConfig.resolve = async (
          source: unknown,
          args: Record<string, unknown>,
          context: ResolverContext,
          info: GraphQLResolveInfo
        ) => {
          const { user } = context;

          const permissionValues = permissions.map(permission => {
            const permissionValue = (
              PermissionConstants as Record<string, string>
            )[permission];
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

          const result = await resolve(source, args, context, info);
          return result;
        };
      }

      return fieldConfig;
    },
  });
}
