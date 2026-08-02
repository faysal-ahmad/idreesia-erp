/* eslint "no-param-reassign": "off" */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver } from 'graphql';
import type {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLResolveInfo,
} from 'graphql';

import { hasInstanceAccess } from 'meteor/idreesia-common/server/graphql-api/security';

type DirectiveSchema = Parameters<typeof mapSchema>[0];

interface ResolverContext {
  user?: Parameters<typeof hasInstanceAccess>[0];
}

interface CheckInstanceAccessDirectiveArgs {
  instanceIdArgName?: string;
  returnType?: 'object' | 'list' | 'paged-list';
  dataFieldName?: string;
}

export default function CheckInstanceAccessDirective(schema: DirectiveSchema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (
      fieldConfig: GraphQLFieldConfig<unknown, ResolverContext>
    ) => {
      const directive = getDirective(
        schema,
        fieldConfig,
        'checkInstanceAccess'
      )?.[0] as CheckInstanceAccessDirectiveArgs | undefined;
      if (directive) {
        const resolve = (fieldConfig.resolve ??
          defaultFieldResolver) as GraphQLFieldResolver<
          unknown,
          ResolverContext
        >;
        // The returnType could be set to object, list, paged-list
        const {
          instanceIdArgName,
          returnType = 'object',
          dataFieldName = 'data',
        } = directive;

        fieldConfig.resolve = async (
          source: unknown,
          args: Record<string, string | undefined>,
          context: ResolverContext,
          info: GraphQLResolveInfo
        ) => {
          const { user } = context;
          const resolverArgs = args;
          const instanceId = instanceIdArgName
            ? resolverArgs[instanceIdArgName]
            : undefined;
          if (!instanceId) {
            throw new Error(
              `Instance ID value not recevied for ${info.fieldName}`
            );
          }

          if (hasInstanceAccess(user, instanceId) === false) {
            if (info.parentType.name === 'Query') {
              if (returnType === 'object') return null;
              else if (returnType === 'list') return [];
              else if (returnType === 'paged-list') {
                return {
                  [dataFieldName]: [],
                  totalResults: 0,
                };
              }
            }

            // It is a mutation, throw a not-allowed exception
            throw new Error(
              `You do not have required instance access for this operation.`
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
