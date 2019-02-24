import "./register-users";
import "./create-account-indexes";
import "./create-hr-indexes";
import "./create-inventory-indexes";
import "./create-companies";
import "./import-inventory-data";
import "./setup-rest-endpoints";

import { ApolloServer } from "apollo-server-express";
import { WebApp } from "meteor/webapp";
import { getUser } from "meteor/apollo";
import { typeDefs, resolvers } from "/imports/api";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => ({
    user: await getUser(req.headers.authorization),
  }),
});

server.applyMiddleware({
  app: WebApp.connectHandlers,
  path: "/graphql",
});

WebApp.connectHandlers.use("/graphql", (req, res) => {
  if (req.method === "GET") {
    res.end();
  }
});
