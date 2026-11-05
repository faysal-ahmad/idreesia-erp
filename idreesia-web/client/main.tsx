import React from 'react';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { BrowserRouter } from 'react-router-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { App as AntdApp } from 'antd';
import { ErrorBoundary } from 'react-error-boundary';

import {
  ApolloLink,
  ApolloClient,
  CombinedGraphQLErrors,
  InMemoryCache,
} from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { HttpLink } from '@apollo/client/link/http';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';

import './main.css';
import './attendance.css';
import './karkun-cards.css';
import './mehfil-cards.css';
import './stay-cards.css';
/* Page CSS lives next to UI modules; load only from this client entry.
 * Use *.styles.css — same basename as a .tsx (list.css vs list.tsx)
 * makes Meteor resolve extensionless imports to the CSS object. */
import '../imports/ui/modules/hr/ms-duties/duty-expanded.styles.css';
import '../imports/ui/modules/hr/duty-planning/duty-planning.styles.css';
import '../imports/ui/modules/common/visitors/list.styles.css';
import '../imports/ui/modules/common/visitors/general-info.styles.css';
import '../imports/ui/modules/common/people/picture.styles.css';
import '../imports/ui/modules/security/visitor-registeration/scan/result-grid.styles.css';
import '../imports/ui/modules/security/security-server/security-server.styles.css';
import '../imports/ui/modules/admin/deleted-people/relation-counts-table.styles.css';
import '../imports/ui/modules/correspondence/inbox/inbox.styles.css';

import App from '../imports/ui/app';
import { AntdFeedbackBridge } from '../imports/ui/antd-feedback';
import combinedReducer from '../imports/ui/reducers/combined-reducer';
import { initMonitoring, reportError } from '../imports/ui/monitoring';

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

// GraphQL errors are already reported by the server (apollo-error-formatter),
// so only transport/network failures are reported from here.
const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) return;
  reportError(error, {
    source: 'apollo-network',
    operation: operation.operationName ?? '',
  });
});

const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

initMonitoring();

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
            <ErrorBoundary
              fallbackRender={({ error }) => (
                <div style={{ padding: 24 }}>
                  <h3>Something went wrong</h3>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {error?.message ?? String(error)}
                  </pre>
                </div>
              )}
              onError={error => reportError(error, { source: 'app-root' })}
            >
              <App />
            </ErrorBoundary>
          </AntdApp>
        </ApolloProviderAny>
      </Provider>
    </Router>
  );
});
