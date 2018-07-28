import './register-users';
import './create-indexes';

import { WebApp } from 'meteor/webapp';
import { createApolloServer } from 'meteor/apollo';
import { makeExecutableSchema } from 'graphql-tools';
import bodyParser from 'body-parser';
import { graphqlExpress } from 'graphql-server-express';
import cors from 'cors';

import { typeDefs, resolvers } from '/imports/api';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const corsOptions = {
  origin: true,
  credentials: true,
  methods: 'POST, GET, OPTIONS',
  allowedHeaders: 'content-type, authorization, content-length, x-requested-with, accept, origin, meteor-login-token',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

createApolloServer(
  { schema },
  { configServer: expressServer => {
      expressServer.use(cors(corsOptions));
      expressServer.listen({ port: 4000 }, () =>
        console.log('🚀 Server ready at http://localhost:4000'),
      );
    },
  }
);

var connectHandler = WebApp.connectHandlers;
Meteor.startup(() => {
  connectHandler.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', ['GET', 'POST', 'OPTIONS']);
    res.setHeader('Access-Control-Allow-Headers', ['Content-Type', 'Authorization', 'X-Requested-With', 'content-length', 'accept', 'origin', 'meteor-login-token']);
    return next();
  });
});
