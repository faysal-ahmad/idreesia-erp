import { ApolloLink, ApolloClient, CombinedGraphQLErrors, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';

import { persistLink, startApolloPersistence } from './apollo-persist';
import { backendAccounts, backendUrl } from './backend';
import { reportError } from './monitoring';

const httpLink = new HttpLink({ uri: `${backendUrl}/graphql` });

// The server resolves the raw Meteor login token in this header to the user
// (idreesia-web/imports/startup/server/get-user.ts).
const authLink = new SetContextLink(prevContext => {
  const token = backendAccounts?._storedLoginToken();
  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { authorization: token } : {}),
    },
  };
});

// GraphQL errors are already reported by the backend (apollo-error-formatter),
// so only transport failures are reported from here - and not while offline,
// which the app handles by showing saved data.
const errorLink = new ErrorLink(({ error, operation }) => {
  if (CombinedGraphQLErrors.is(error)) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
  reportError(error, {
    source: 'apollo-network',
    operation: operation.operationName ?? '',
  });
});

const cache = new InMemoryCache();

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, persistLink, httpLink]),
  cache,
});

// The cache is kept on the device so browsed data can be read offline. It is
// restored before the first render (client/main.tsx) and wiped on logout
// (ui/auth/accounts.ts).
startApolloPersistence(cache);
