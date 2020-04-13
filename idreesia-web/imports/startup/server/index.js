import './configure-services';
import './setup-rest-endpoints';
import './migrations';

import { ApolloServer } from 'apollo-server-express';
import { WebApp } from 'meteor/webapp';
import { getUser } from 'meteor/apollo';
import { typeDefs, resolvers } from 'meteor/idreesia-common/server/graphql-api';
import {
  CheckPermissionsDirective,
  CheckInstanceAccessDirective,
} from 'meteor/idreesia-common/server/graphql-api/_directives';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    checkPermissions: CheckPermissionsDirective,
    checkInstanceAccess: CheckInstanceAccessDirective,
  },
  context: async ({ req }) => ({
    user: await getUser(req.headers.authorization),
  }),
});

server.applyMiddleware({
  app: WebApp.connectHandlers,
  path: '/graphql',
});

WebApp.connectHandlers.use('/graphql', (req, res) => {
  if (req.method === 'GET') {
    res.end();
  }
});
