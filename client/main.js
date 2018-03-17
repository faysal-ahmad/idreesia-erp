import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { ApolloProvider } from 'react-apollo';
import { ApolloLink, from } from "apollo-link";
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

import '../node_modules/antd/dist/antd.css';

import App from '../imports/ui/app';

const cache = new InMemoryCache();
const httpLink = new HttpLink({
  uri: Meteor.absoluteUrl('graphql')
});

const authLink = new ApolloLink((operation, forward) => {
  const token = Accounts._storedLoginToken();
  operation.setContext(() => ({
    headers: {
      "meteor-login-token": token
    }
  }));
  return forward(operation);
});

const client = new ApolloClient({
  cache,
  link: from([authLink, httpLink]),
});

Meteor.startup(() => {
  render(
    <BrowserRouter>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </BrowserRouter>,
    document.getElementById('render-target')
  );
});
