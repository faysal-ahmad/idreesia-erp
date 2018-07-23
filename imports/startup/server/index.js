import './register-users';
import './create-indexes';

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
  origin2(origin, callback){
      console.log(`Checking CORS for ${origin}`);
      callback(null, true);
  },
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
      /*
      expressServer.use('/graphql', (req,res,next)=>{
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Headers', 'content-type, authorization, content-length, x-requested-with, accept, origin, meteor-login-token');
        res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        res.header('Allow', 'POST, GET, OPTIONS')
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      }, graphqlExpress({
        schema,
        graphiql: process.env.NODE_ENV === 'development',
      }));
      */
      // expressServer.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))
    },
  }
);
