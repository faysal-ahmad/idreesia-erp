/* eslint "no-param-reassign": "off" */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver } from 'graphql';
import type {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
} from 'graphql';

import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import {
  loadStoreAccessMap,
  storePermissionsOf,
  type StoreAccessMap,
  type StoreAccessUser,
} from 'meteor/idreesia-common/server/business-logic/inventory/store-access';

type DirectiveSchema = Parameters<typeof mapSchema>[0];

interface ResolverContext {
  user?: StoreAccessUser | null;
  // The caller's permissions on every store, loaded once per request.
  storeAccessMap?: Promise<StoreAccessMap>;
}

interface CheckStoreAccessDirectiveArgs {
  permissions?: string[];
  physicalStoreIdArgName?: string;
  returnType?: 'object' | 'list' | 'paged-list';
  dataFieldName?: string;
}

/**
 * `@checkStoreAccess(permissions: [...], physicalStoreIdArgName: "...")`: the
 * caller must hold at least one of the permissions on the store named by the
 * argument. A super-admin holds every permission on every store.
 *
 * When denied, a query returns the field's empty value (`returnType`: null, []
 * or an empty page) and a mutation throws.
 */
export default function CheckStoreAccessDirective(schema: DirectiveSchema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (
      fieldConfig: GraphQLFieldConfig<unknown, ResolverContext>
    ) => {
      const directive = getDirective(
        schema,
        fieldConfig,
        'checkStoreAccess'
      )?.[0] as CheckStoreAccessDirectiveArgs | undefined;
      if (directive) {
        const resolve = (fieldConfig.resolve ??
          defaultFieldResolver) as GraphQLFieldResolver<
          unknown,
          ResolverContext
        >;
        const {
          permissions = [],
          physicalStoreIdArgName,
          returnType = 'object',
          dataFieldName = 'data',
        } = directive;

        fieldConfig.resolve = async (
          source: unknown,
          args: Record<string, string | undefined>,
          context: ResolverContext,
          info: GraphQLResolveInfo
        ) => {
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

          const physicalStoreId = physicalStoreIdArgName
            ? args[physicalStoreIdArgName]
            : undefined;
          if (!physicalStoreId) {
            throw new Error(
              `Store ID value not received for ${info.fieldName}`
            );
          }

          const { user } = context;
          if (!context.storeAccessMap) {
            context.storeAccessMap = loadStoreAccessMap(user);
          }
          const held = storePermissionsOf(
            user,
            await context.storeAccessMap,
            physicalStoreId
          );

          if (!permissionValues.some(permission => held.includes(permission))) {
            if (info.parentType.name === 'Query') {
              if (returnType === 'object') return null;
              if (returnType === 'list') return [];
              if (returnType === 'paged-list') {
                return { [dataFieldName]: [], totalResults: 0 };
              }
            }

            // It is a mutation, throw a not-allowed exception
            throw new Error(
              'You do not have required store access for this operation.'
            );
          }

          return resolve(source, args, context, info);
        };
      }

      return fieldConfig;
    },
  });
}
