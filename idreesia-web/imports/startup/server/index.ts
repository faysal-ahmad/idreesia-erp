// @ts-nocheck
import path from 'path';
import { config } from 'dotenv';

// aldeed:collection2@4.2+ ships attachSchema as an opt-in eager module —
// without this, Mongo.Collection.prototype.attachSchema is never patched in.
import 'meteor/aldeed:collection2/static';

config({
  path: path.resolve(process.env.PWD, '.env'),
});

import './configure-services';
import './setup-rest-endpoints';
import './migrations';

import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
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
