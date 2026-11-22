/* eslint-disable no-param-reassign */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLError, defaultFieldResolver } from 'graphql';
import type {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
} from 'graphql';

import {
  MehfilKarkunsPermissionValues,
  type MehfilKarkunsPermission,
} from 'meteor/idreesia-common/constants/mehfil-karkuns';
import { loadMehfilKarkunsAccess } from 'meteor/idreesia-common/server/business-logic/mehfil-karkuns';

type DirectiveSchema = Parameters<typeof mapSchema>[0];

interface MehfilKarkunsContext {
  user?: { _id?: string; locked?: boolean; isSuperAdmin?: boolean } | null;
}

interface CheckMehfilKarkunsAccessDirectiveArgs {
  permission?: string;
  locationIdArgName?: string;
}

// Turns the schema's permission name (UPDATE) into the stored value
// (update), refusing a name that is not a permission.
const toPermission = (name: string | undefined, fieldName: string) => {
  const permission = (name ?? '')
    .toLowerCase()
    .replace(/_/g, '-') as MehfilKarkunsPermission;
  if (!MehfilKarkunsPermissionValues.includes(permission)) {
    throw new Error(
      `Invalid Mehfil Karkuns permission ${name} specified for ${fieldName}`
    );
  }
  return permission;
};

/**
 * `@checkMehfilKarkunsAccess(permission: ...)`: the caller must hold the
 * permission on the mehfil named by the field's location id argument. A
 * super-admin holds every permission.
 */
export default function CheckMehfilKarkunsAccessDirective(
  schema: DirectiveSchema
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (
      fieldConfig: GraphQLFieldConfig<unknown, MehfilKarkunsContext>
    ) => {
      const directive = getDirective(
        schema,
        fieldConfig,
        'checkMehfilKarkunsAccess'
      )?.[0] as CheckMehfilKarkunsAccessDirectiveArgs | undefined;
      if (directive) {
        const resolve = (fieldConfig.resolve ??
          defaultFieldResolver) as GraphQLFieldResolver<
          unknown,
          MehfilKarkunsContext
        >;
        const { permission: permissionName, locationIdArgName = 'locationId' } =
          directive;

        fieldConfig.resolve = async (
          source: unknown,
          args: Record<string, unknown>,
          context: MehfilKarkunsContext,
          info: GraphQLResolveInfo
        ) => {
          const required = toPermission(permissionName, info.fieldName);
          const locationId = args[locationIdArgName];
          if (typeof locationId !== 'string' || !locationId) {
            throw new Error(
              `Location ID value not received for ${info.fieldName}`
            );
          }

          const permissions = await loadMehfilKarkunsAccess(
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
