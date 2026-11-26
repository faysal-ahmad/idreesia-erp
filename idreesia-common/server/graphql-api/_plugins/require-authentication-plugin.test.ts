import { describe, expect, it } from 'vitest';
import { ApolloServer } from '@apollo/server';
import { getOperationAST, parse } from 'graphql';

import {
  RequireAuthenticationPlugin,
  getRootFieldNames,
  isAllowedAnonymously,
} from './require-authentication-plugin';

const opOf = (source: string) => {
  const document = parse(source);
  const operation = getOperationAST(document);
  if (!operation) throw new Error('no operation');
  return { document, operation };
};

describe('getRootFieldNames', () => {
  it('collects root fields through inline fragments and fragment spreads', () => {
    const { document, operation } = opOf(`
      query q {
        currentUser { _id }
        ... on Query { pagedSecurityMehfilPeople { totalResults } }
        ...Rest
      }
      fragment Rest on Query { allTeams { _id } ...Rest }
    `);
    expect([...getRootFieldNames(document, operation)].sort()).toEqual([
      'allTeams',
      'currentUser',
      'pagedSecurityMehfilPeople',
    ]);
  });
});

describe('isAllowedAnonymously', () => {
  const allowed = (source: string) => {
    const { document, operation } = opOf(source);
    return isAllowedAnonymously(document, operation);
  };

  it('allows only operations made entirely of anonymous fields', () => {
    expect(allowed('{ currentUser { _id } __typename }')).toBe(true);
    expect(allowed('mutation { registerUser(displayName: "a", email: "b") }')).toBe(true);
    expect(allowed('{ currentUser { _id } pagedSecurityMehfilPeople { totalResults } }')).toBe(false);
    expect(allowed('{ __schema { types { name } } }')).toBe(false);
  });
});

describe('RequireAuthenticationPlugin', () => {
  const server = new ApolloServer<{ user?: unknown }>({
    typeDefs: `
      type Query { currentUser: String, secret: String }
      type Mutation { registerUser: Int }
    `,
    resolvers: {
      Query: { currentUser: () => 'me', secret: () => 'shh' },
      Mutation: { registerUser: () => 1 },
    },
    plugins: [RequireAuthenticationPlugin()],
  });

  const run = async (query: string, user?: unknown) => {
    const response = await server.executeOperation(
      { query },
      { contextValue: { user } }
    );
    if (response.body.kind !== 'single') throw new Error('unexpected incremental');
    return { http: response.http, result: response.body.singleResult };
  };

  it('rejects anonymous requests for protected fields without running resolvers', async () => {
    const { http, result } = await run('{ secret }');
    expect(http.status).toBe(200);
    expect(result.data).toBeUndefined();
    expect(result.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED');
  });

  it('lets anonymous callers use the allowlisted fields', async () => {
    expect((await run('{ currentUser }')).result.data).toEqual({ currentUser: 'me' });
    expect((await run('mutation { registerUser }')).result.data).toEqual({ registerUser: 1 });
  });

  it('lets logged-in callers use any field', async () => {
    expect((await run('{ secret }', { _id: 'u1' })).result.data).toEqual({ secret: 'shh' });
  });
});
