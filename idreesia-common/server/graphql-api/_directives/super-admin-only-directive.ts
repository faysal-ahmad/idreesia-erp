/* eslint-disable no-param-reassign */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLError, defaultFieldResolver } from 'graphql';
import type {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
} from 'graphql';

import { isSuperAdmin } from 'meteor/idreesia-common/server/graphql-api/security';

type DirectiveSchema = Parameters<typeof mapSchema>[0];

interface ResolverContext {
  user?: Parameters<typeof isSuperAdmin>[0];
}

/**
 * `@superAdminOnly`: only an unlocked super-admin may call the field. It
 * always throws when denied, query or mutation.
 */
export default function SuperAdminOnlyDirective(schema: DirectiveSchema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (
      fieldConfig: GraphQLFieldConfig<unknown, ResolverContext>
    ) => {
      if (getDirective(schema, fieldConfig, 'superAdminOnly')?.[0]) {
        const resolve = (fieldConfig.resolve ??
          defaultFieldResolver) as GraphQLFieldResolver<
          unknown,
          ResolverContext
        >;

        fieldConfig.resolve = async (
          source: unknown,
          args: Record<string, unknown>,
          context: ResolverContext,
          info: GraphQLResolveInfo
        ) => {
          if (!isSuperAdmin(context.user)) {
            throw new GraphQLError('Only a super admin can do this.', {
              extensions: { code: 'FORBIDDEN' },
            });
          }

          return resolve(source, args, context, info);
        };
      }

      return fieldConfig;
    },
  });
}
