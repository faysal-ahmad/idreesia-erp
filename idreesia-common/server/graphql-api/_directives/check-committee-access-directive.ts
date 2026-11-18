/* eslint-disable no-param-reassign */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLError, defaultFieldResolver } from 'graphql';
import type {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
} from 'graphql';

import { Committees } from 'meteor/idreesia-common/server/collections/admin';
import {
  CommitteeMemberRoles,
  CommitteeMemberRoleValues,
  type CommitteeMemberRole,
} from 'meteor/idreesia-common/constants/organization';
import {
  getCommitteeRole,
  type CommitteeAccessContext,
  type CommitteeDocument,
} from 'meteor/idreesia-common/server/graphql-api/workspaces/committee/access';

type DirectiveSchema = Parameters<typeof mapSchema>[0];

interface CheckCommitteeAccessDirectiveArgs {
  roles?: string[];
  committeeIdArgName?: string;
}

const forbidden = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } });

// Turns the schema's role names (COORDINATOR) into the stored values
// (coordinator), refusing a name that is not a committee role.
const toRoles = (names: string[], fieldName: string) =>
  names.map(name => {
    const role = name.toLowerCase() as CommitteeMemberRole;
    if (!CommitteeMemberRoleValues.includes(role)) {
      throw new Error(`Invalid committee role ${name} specified for ${fieldName}`);
    }
    return role;
  });

/**
 * `@checkCommitteeAccess(roles: [...])`: the caller must hold one of the
 * roles on the committee named by the field's committee id argument. A
 * super-admin counts as a coordinator. The loaded committee is kept on the
 * context (`getCommitteeAccess`) for the resolver.
 *
 * This is only the role check. That the committee has the feature switched on,
 * and rules that depend on the item (a guest only sees meetings they are
 * invited to, say) stay in the feature code.
 */
export default function CheckCommitteeAccessDirective(
  schema: DirectiveSchema
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (
      fieldConfig: GraphQLFieldConfig<unknown, CommitteeAccessContext>
    ) => {
      const directive = getDirective(
        schema,
        fieldConfig,
        'checkCommitteeAccess'
      )?.[0] as CheckCommitteeAccessDirectiveArgs | undefined;
      if (directive) {
        const resolve = (fieldConfig.resolve ??
          defaultFieldResolver) as GraphQLFieldResolver<
          unknown,
          CommitteeAccessContext
        >;
        const { roles: roleNames = [], committeeIdArgName = 'committeeId' } =
          directive;

        fieldConfig.resolve = async (
          source: unknown,
          args: Record<string, unknown>,
          context: CommitteeAccessContext,
          info: GraphQLResolveInfo
        ) => {
          const allowedRoles = toRoles(roleNames, info.fieldName);
          const committeeId = args[committeeIdArgName];
          if (typeof committeeId !== 'string' || !committeeId) {
            throw new Error(
              `Committee ID value not received for ${info.fieldName}`
            );
          }

          const committee = (await Committees.findOneAsync(
            committeeId
          )) as CommitteeDocument | undefined;
          const role = committee ? getCommitteeRole(context.user, committee) : null;
          if (!committee || !role) {
            throw forbidden('You are not a member of this committee.');
          }
          if (!allowedRoles.includes(role)) {
            throw forbidden(
              'Your role in this committee does not allow this operation.'
            );
          }

          context.committeeAccess = {
            ...context.committeeAccess,
            [committeeId]: {
              committee,
              role,
              isCoordinator: role === CommitteeMemberRoles.COORDINATOR,
            },
          };

          return resolve(source, args, context, info);
        };
      }

      return fieldConfig;
    },
  });
}
