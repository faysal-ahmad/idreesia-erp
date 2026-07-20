import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { BrowserRouter } from 'react-router-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  HttpLink,
  from,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import './main.css';
import './attendance.css';
import './karkun-cards.css';
import './mehfil-cards.css';
import './stay-cards.css';

import App from '../imports/ui/app';
import combinedReducer from '../imports/ui/reducers/combined-reducer';

const store = createStore(combinedReducer);

const httpLink = new HttpLink({ uri: '/graphql' });

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    authorization: Accounts._storedLoginToken(),
  },
}));

const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

Meteor.startup(() => {
  render(
    <BrowserRouter>
      <Provider store={store}>
        <ApolloProvider client={client}>
          <App />
        </ApolloProvider>
      </Provider>
    </BrowserRouter>,
    document.getElementById('render-target')
  );
});
