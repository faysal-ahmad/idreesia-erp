import React from 'react';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { BrowserRouter } from 'react-router-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { App as AntdApp } from 'antd';

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
/* Page CSS lives next to UI modules; load only from this client entry.
 * Use *.styles.css — same basename as a .tsx (list.css vs list.tsx)
 * makes Meteor resolve extensionless imports to the CSS object. */
import '../imports/ui/modules/common/visitors/list.styles.css';
import '../imports/ui/modules/common/visitors/general-info.styles.css';
import '../imports/ui/modules/common/people/picture.styles.css';

import App from '../imports/ui/app';
import { AntdFeedbackBridge } from '../imports/ui/antd-feedback';
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
  const container = document.getElementById('render-target');
  if (!container) {
    return;
  }

  createRoot(container).render(
    <Router>
      <Provider store={store}>
        <ApolloProviderAny client={client}>
          <AntdApp>
            <AntdFeedbackBridge />
            <App />
          </AntdApp>
        </ApolloProviderAny>
      </Provider>
    </Router>
  );
});
