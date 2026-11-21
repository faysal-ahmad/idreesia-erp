/* eslint-disable no-param-reassign */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLError, defaultFieldResolver } from 'graphql';
import type {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
} from 'graphql';

import {
  MehfilPermissionsPermissionValues,
  type MehfilPermissionsPermission,
} from 'meteor/idreesia-common/constants/mehfil-permissions';
import { loadMehfilPermissionsAccess } from 'meteor/idreesia-common/server/business-logic/mehfil-permissions';

type DirectiveSchema = Parameters<typeof mapSchema>[0];

interface MehfilPermissionsContext {
  user?: { _id?: string; locked?: boolean; isSuperAdmin?: boolean } | null;
}

interface CheckMehfilPermissionsAccessDirectiveArgs {
  permission?: string;
  locationIdArgName?: string;
}

// Turns the schema's permission name (MANAGE) into the stored value
// (manage), refusing a name that is not a permission.
const toPermission = (name: string | undefined, fieldName: string) => {
  const permission = (name ?? '')
    .toLowerCase()
    .replace(/_/g, '-') as MehfilPermissionsPermission;
  if (!MehfilPermissionsPermissionValues.includes(permission)) {
    throw new Error(
      `Invalid Mehfil Permissions permission ${name} specified for ${fieldName}`
    );
  }
  return permission;
};

/**
 * `@checkMehfilPermissionsAccess(permission: ...)`: the caller must hold the
 * permission on the mehfil named by the field's location id argument. A
 * super-admin holds every permission.
 */
export default function CheckMehfilPermissionsAccessDirective(
  schema: DirectiveSchema
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (
      fieldConfig: GraphQLFieldConfig<unknown, MehfilPermissionsContext>
    ) => {
      const directive = getDirective(
        schema,
        fieldConfig,
        'checkMehfilPermissionsAccess'
      )?.[0] as CheckMehfilPermissionsAccessDirectiveArgs | undefined;
      if (directive) {
        const resolve = (fieldConfig.resolve ??
          defaultFieldResolver) as GraphQLFieldResolver<
          unknown,
          MehfilPermissionsContext
        >;
        const { permission: permissionName, locationIdArgName = 'locationId' } =
          directive;

        fieldConfig.resolve = async (
          source: unknown,
          args: Record<string, unknown>,
          context: MehfilPermissionsContext,
          info: GraphQLResolveInfo
        ) => {
          const required = toPermission(permissionName, info.fieldName);
          const locationId = args[locationIdArgName];
          if (typeof locationId !== 'string' || !locationId) {
            throw new Error(
              `Location ID value not received for ${info.fieldName}`
            );
          }

          const permissions = await loadMehfilPermissionsAccess(
            context.user,
            locationId
          );
          if (!permissions.includes(required)) {
            throw new GraphQLError(
              'You do not have permission for this operation on this mehfil.',
              { extensions: { code: 'FORBIDDEN' } }
            );
          }

          return resolve(source, args, context, info);
        };
      }

      return fieldConfig;
    },
  });
}
