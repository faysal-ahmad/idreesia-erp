import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { BrowserRouter } from 'react-router-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import { ApolloProvider } from 'react-apollo';
import ApolloClient from 'apollo-boost';

import './main.css';
import './attendance.css';
import './karkun-cards.css';
import './mehfil-cards.css';
import './stay-cards.css';
import '@ant-design/compatible/assets/index.css';

import App from '../imports/ui/app';
import combinedReducer from '../imports/ui/reducers/combined-reducer';

const store = createStore(combinedReducer);

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
      <Provider store={store}>
        <ApolloProvider client={client}>
          <App />
        </ApolloProvider>
      </Provider>
    </BrowserRouter>,
    document.getElementById('render-target')
  );
});
