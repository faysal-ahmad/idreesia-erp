/* eslint-disable no-param-reassign */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLError, defaultFieldResolver } from 'graphql';
import type {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
} from 'graphql';

import {
  MehfilDetailsPermissionValues,
  type MehfilDetailsPermission,
} from 'meteor/idreesia-common/constants/mehfil-details';
import { loadMehfilDetailsAccess } from 'meteor/idreesia-common/server/business-logic/mehfil-details';

type DirectiveSchema = Parameters<typeof mapSchema>[0];

interface MehfilDetailsContext {
  user?: { _id?: string; locked?: boolean; isSuperAdmin?: boolean } | null;
}

interface CheckMehfilDetailsAccessDirectiveArgs {
  permission?: string;
  locationIdArgName?: string;
}

// Turns the schema's permission name (UPDATE) into the stored value
// (update), refusing a name that is not a permission.
const toPermission = (name: string | undefined, fieldName: string) => {
  const permission = (name ?? '')
    .toLowerCase()
    .replace(/_/g, '-') as MehfilDetailsPermission;
  if (!MehfilDetailsPermissionValues.includes(permission)) {
    throw new Error(
      `Invalid Mehfil Details permission ${name} specified for ${fieldName}`
    );
  }
  return permission;
};

/**
 * `@checkMehfilDetailsAccess(permission: ...)`: the caller must hold the
 * permission on the mehfil named by the field's location id argument. A
 * super-admin holds every permission.
 */
export default function CheckMehfilDetailsAccessDirective(
  schema: DirectiveSchema
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (
      fieldConfig: GraphQLFieldConfig<unknown, MehfilDetailsContext>
    ) => {
      const directive = getDirective(
        schema,
        fieldConfig,
        'checkMehfilDetailsAccess'
      )?.[0] as CheckMehfilDetailsAccessDirectiveArgs | undefined;
      if (directive) {
        const resolve = (fieldConfig.resolve ??
          defaultFieldResolver) as GraphQLFieldResolver<
          unknown,
          MehfilDetailsContext
        >;
        const { permission: permissionName, locationIdArgName = 'locationId' } =
          directive;

        fieldConfig.resolve = async (
          source: unknown,
          args: Record<string, unknown>,
          context: MehfilDetailsContext,
          info: GraphQLResolveInfo
        ) => {
          const required = toPermission(permissionName, info.fieldName);
          const locationId = args[locationIdArgName];
          if (typeof locationId !== 'string' || !locationId) {
            throw new Error(
              `Location ID value not received for ${info.fieldName}`
            );
          }

          const permissions = await loadMehfilDetailsAccess(
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
