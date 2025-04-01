import './configure-services';
import './setup-rest-endpoints';
import './migrations';

import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebApp } from 'meteor/webapp';
import { getUser } from 'meteor/apollo';
import { typeDefs, resolvers } from 'meteor/idreesia-common/server/graphql-api';
import { getDataLoaders } from 'meteor/idreesia-common/server/data-loaders';
import {
  CheckPermissionsDirective,
  CheckInstanceAccessDirective,
} from 'meteor/idreesia-common/server/graphql-api/_directives';
import { apolloErrorFormatter } from './apollo-error-formatter';

// Build GraphQL schema based on SDL definitions and resolvers maps
let schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

schema = CheckPermissionsDirective(schema);
schema = CheckInstanceAccessDirective(schema);

const server = new ApolloServer({
  schema,
  formatError: apolloErrorFormatter,
  schemaDirectives: {
    checkPermissions: CheckPermissionsDirective,
    checkInstanceAccess: CheckInstanceAccessDirective,
  },
  context: async ({ req }) => ({
    user: await getUser(req.headers.authorization),
    loaders: getDataLoaders(),
  }),
});

const startServer = async () => {
  await server.start();
  server.applyMiddleware({
    app: WebApp.connectHandlers,
    path: '/graphql',
  });

  WebApp.connectHandlers.use('/graphql', (req, res) => {
    if (req.method === 'GET') {
      res.end();
    }
  });
};

startServer();
