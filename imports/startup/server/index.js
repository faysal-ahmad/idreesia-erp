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
  origin(origin, callback){
      callback(null, true);
  },
  credentials: true
};

createApolloServer(
  { schema },
  { configServer: expressServer => {
      expressServer.use(cors());
      /*
      expressServer.use('/graphql',(req,res,next)=>{

        res.header('Access-Control-Allow-Credentials', true);
        res.header('Access-Control-Allow-Headers', 'content-type, authorization, content-length, x-requested-with, accept, origin');
        res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        res.header('Allow', 'POST, GET, OPTIONS')
        res.header('Access-Control-Allow-Origin', '*');
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      }, graphqlExpress({
        schema,
        graphiql: true
      }));
      // expressServer.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))
      */
    },
  }
);
