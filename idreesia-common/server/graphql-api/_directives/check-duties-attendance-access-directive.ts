/* eslint-disable no-param-reassign */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLError, defaultFieldResolver } from 'graphql';
import type {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
} from 'graphql';

import {
  DutiesAttendancePermissionValues,
  type DutiesAttendancePermission,
} from 'meteor/idreesia-common/constants/duties-attendance';
import {
  loadDutiesAttendanceAccess,
  type DutiesAttendanceAccessContext,
} from 'meteor/idreesia-common/server/graphql-api/workspaces/duties-attendance/access';

type DirectiveSchema = Parameters<typeof mapSchema>[0];

interface CheckDutiesAttendanceAccessDirectiveArgs {
  permission?: string;
  locationIdArgName?: string;
}

// Turns the schema's permission name (MANAGE_AND_PLAN_DUTIES) into the stored
// value (manage-and-plan-duties), refusing a name that is not a permission.
const toPermission = (name: string | undefined, fieldName: string) => {
  const permission = (name ?? '')
    .toLowerCase()
    .replace(/_/g, '-') as DutiesAttendancePermission;
  if (!DutiesAttendancePermissionValues.includes(permission)) {
    throw new Error(
      `Invalid Duties and Attendance permission ${name} specified for ${fieldName}`
    );
  }
  return permission;
};

/**
 * `@checkDutiesAttendanceAccess(permission: ...)`: the caller must hold the
 * permission in the Duties and Attendance workspace of the location named by
 * the field's location id argument. A super-admin holds every permission. The
 * loaded access is kept on the context (`getDutiesAttendanceAccess`) for the
 * resolver.
 */
export default function CheckDutiesAttendanceAccessDirective(
  schema: DirectiveSchema
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (
      fieldConfig: GraphQLFieldConfig<unknown, DutiesAttendanceAccessContext>
    ) => {
      const directive = getDirective(
        schema,
        fieldConfig,
        'checkDutiesAttendanceAccess'
      )?.[0] as CheckDutiesAttendanceAccessDirectiveArgs | undefined;
      if (directive) {
        const resolve = (fieldConfig.resolve ??
          defaultFieldResolver) as GraphQLFieldResolver<
          unknown,
          DutiesAttendanceAccessContext
        >;
        const { permission: permissionName, locationIdArgName = 'locationId' } =
          directive;

        fieldConfig.resolve = async (
          source: unknown,
          args: Record<string, unknown>,
          context: DutiesAttendanceAccessContext,
          info: GraphQLResolveInfo
        ) => {
          const required = toPermission(permissionName, info.fieldName);
          const locationId = args[locationIdArgName];
          if (typeof locationId !== 'string' || !locationId) {
            throw new Error(
              `Location ID value not received for ${info.fieldName}`
            );
          }

          const access = await loadDutiesAttendanceAccess(
            context.user,
            locationId
          );
          if (!access.permissions.includes(required)) {
            throw new GraphQLError(
              'You do not have permission for this operation in this workspace.',
              { extensions: { code: 'FORBIDDEN' } }
            );
          }

          context.dutiesAttendanceAccess = {
            ...context.dutiesAttendanceAccess,
            [locationId]: access,
          };

          return resolve(source, args, context, info);
        };
      }

      return fieldConfig;
    },
  });
}
