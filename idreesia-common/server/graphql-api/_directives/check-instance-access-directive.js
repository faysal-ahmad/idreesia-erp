/* eslint "no-param-reassign": "off" */
import { SchemaDirectiveVisitor } from 'apollo-server-express';
import { defaultFieldResolver } from 'graphql';

import { hasInstanceAccess } from 'meteor/idreesia-common/server/graphql-api/security';

export default class CheckInstanceAccessDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { instanceIdArgName, dataFieldName = 'data' } = this.args;

    field.resolve = async (...params) => {
      const [, args, context, info] = params;
      const { user } = context;
      const instanceId = args[instanceIdArgName];
      if (!instanceId) {
        throw new Error(`Instance ID value not recevied for ${info.fieldName}`);
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
}
