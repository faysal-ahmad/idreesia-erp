import { ApolloLink, ApolloClient, InMemoryCache } from '@apollo/client';
import { HttpLink } from '@apollo/client/link/http';
import { SetContextLink } from '@apollo/client/link/context';

import { persistLink, startApolloPersistence } from './apollo-persist';
import { backendAccounts, backendUrl } from './backend';

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

const cache = new InMemoryCache();

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, persistLink, httpLink]),
  cache,
});

// The cache is kept on the device so browsed data can be read offline. It is
// restored before the first render (client/main.tsx) and wiped on logout
// (ui/auth/accounts.ts).
startApolloPersistence(cache);
