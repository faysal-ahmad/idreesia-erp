import "./register-users";
import "./create-indexes";
import "./import-inventory-data";
import "./setup-rest-endpoints";

import { WebApp } from "meteor/webapp";
import { createApolloServer } from "meteor/apollo";
import { makeExecutableSchema } from "graphql-tools";
import cors from "cors";

import { typeDefs, resolvers } from "/imports/api";

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const corsOptions = {
  origin: true,
  credentials: true,
  methods: "POST, GET, OPTIONS",
  allowedHeaders:
    "content-type, authorization, content-length, x-requested-with, accept, origin, meteor-login-token",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

createApolloServer(
  { schema },
  {
    configServer: expressServer => {
      expressServer.use(cors(corsOptions));
      expressServer.listen({ port: 4000 }, () =>
        // eslint-disable-next-line no-console
        console.log("🚀 Apollo Server ready at http://localhost:4000")
      );
    },
  }
);

const connectHandler = WebApp.connectHandlers;
Meteor.startup(() => {
  connectHandler.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", ["GET", "POST", "OPTIONS"]);
    res.setHeader("Access-Control-Allow-Headers", [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "content-length",
      "accept",
      "origin",
      "meteor-login-token",
    ]);
    return next();
  });
});
