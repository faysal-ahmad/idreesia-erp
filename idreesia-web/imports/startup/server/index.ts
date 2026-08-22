import path from 'path';
import { config } from 'dotenv';

// aldeed:collection2@4.2+ ships attachSchema as an opt-in eager module —
// without this, Mongo.Collection.prototype.attachSchema is never patched in.
import 'meteor/aldeed:collection2/static';

config({
  path: path.resolve(process.env.PWD ?? process.cwd(), '.env'),
});

import './configure-services';
import './setup-rest-endpoints';
import './migrations';

import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebApp } from 'meteor/webapp';
import { typeDefs, resolvers } from 'meteor/idreesia-common/server/graphql-api';
import { getDataLoaders } from 'meteor/idreesia-common/server/data-loaders';
import {
  CheckPermissionsDirective,
  CheckInstanceAccessDirective,
} from 'meteor/idreesia-common/server/graphql-api/_directives';
import { getUser } from './get-user';
import { apolloErrorFormatter } from './apollo-error-formatter';

// Build GraphQL schema based on SDL definitions and resolvers maps
let schema: any = makeExecutableSchema({
  typeDefs: typeDefs as any,
  resolvers: resolvers as any,
});

schema = CheckPermissionsDirective(schema) as any;
schema = CheckInstanceAccessDirective(schema) as any;

const server = new ApolloServer({
  schema: schema as any,
  formatError: apolloErrorFormatter as any,
});

const startServer = async () => {
  await server.start();

  const app = express();

  // Preserve prior behavior: a bare GET to /graphql (e.g. a health check)
  // gets an empty 200 instead of falling into Apollo's operation handling.
  app.get('/graphql', (req, res) => {
    res.end();
  });

  app.use(
    '/graphql',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        user: await getUser(req.headers.authorization),
        loaders: getDataLoaders(),
      }),
    })
  );

  WebApp.connectHandlers.use(app);
};

startServer();
