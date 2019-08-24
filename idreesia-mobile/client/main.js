import React from "react";
import { render } from "react-dom";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { BrowserRouter } from "react-router-dom";
import attachFastClick from 'fastclick';

import { ApolloProvider } from "react-apollo";
import ApolloClient from "apollo-boost";
import 'antd-mobile/dist/antd-mobile.css';

import App from "../imports/ui/app";

const client = new ApolloClient({
  uri: "/graphql",
  request: operation =>
    operation.setContext(() => ({
      headers: {
        authorization: Accounts._storedLoginToken(),
      },
    })),
});

Meteor.startup(() => {
  attachFastClick(document.body);
  render(
    <BrowserRouter>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </BrowserRouter>,
    document.getElementById("render-target")
  );
});
