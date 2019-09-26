import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { BrowserRouter } from 'react-router-dom';

import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-boost';

import App from '../imports/ui/app';
import './meeting-cards.css';
import './stay-cards.css';

const client = new ApolloClient({
  uri: '/graphql',
  request: operation =>
    operation.setContext(() => ({
      headers: {
        authorization: Accounts._storedLoginToken(),
      },
    })),
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
