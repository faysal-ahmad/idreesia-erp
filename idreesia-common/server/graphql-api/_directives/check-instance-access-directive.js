/* eslint "no-param-reassign": "off" */
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver } from 'graphql';

import { hasInstanceAccess } from 'meteor/idreesia-common/server/graphql-api/security';

export default function CheckInstanceAccessDirective(schema) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: fieldConfig => {
      const directive = getDirective(
        schema,
        fieldConfig,
        'checkInstanceAccess'
      )?.[0];
      if (directive) {
        const { resolve = defaultFieldResolver } = fieldConfig;
        const { instanceIdArgName, dataFieldName = 'data' } = directive;

        fieldConfig.resolve = async (...params) => {
          const [, args, context, info] = params;
          const { user } = context;
          const instanceId = args[instanceIdArgName];
          if (!instanceId) {
            throw new Error(
              `Instance ID value not recevied for ${info.fieldName}`
            );
          }

          if (hasInstanceAccess(user, instanceId) === false) {
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
              `You do not have required instance access for this operation.`
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
