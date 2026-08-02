import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { BrowserRouter } from 'react-router-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import {
  ApolloLink,
  ApolloClient,
  InMemoryCache,
} from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { HttpLink } from '@apollo/client/link/http';
import { SetContextLink } from '@apollo/client/link/context';

import './main.css';
import './attendance.css';
import './karkun-cards.css';
import './mehfil-cards.css';
import './stay-cards.css';
import './security-visitors-list.css';

import App from '../imports/ui/app';
import combinedReducer from '../imports/ui/reducers/combined-reducer';

const Router = BrowserRouter as any;
const ApolloProviderAny = ApolloProvider as any;
const store = createStore(combinedReducer);

const httpLink = new HttpLink({ uri: '/graphql' });

const authLink = new SetContextLink(((prevContext: any) => ({
  headers: {
    ...prevContext.headers,
    authorization: (Accounts as any)._storedLoginToken(),
  },
})) as any);

const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

Meteor.startup(() => {
  render(
    <Router>
      <Provider store={store}>
        <ApolloProviderAny client={client}>
          <App />
        </ApolloProviderAny>
      </Provider>
    </Router>,
    document.getElementById('render-target') as Element
  );
});
