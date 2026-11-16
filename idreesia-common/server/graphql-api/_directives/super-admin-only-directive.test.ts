import { describe, expect, it } from 'vitest';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import SuperAdminOnlyDirective from './super-admin-only-directive';
import SuperAdminOnlySchema from './super-admin-only';

const schema = SuperAdminOnlyDirective(
  makeExecutableSchema({
    typeDefs: [
      SuperAdminOnlySchema,
      `
      type Query { open: String }
      type Mutation { dangerous: String @superAdminOnly }
    `,
    ],
    resolvers: {
      Query: { open: () => 'open' },
      Mutation: { dangerous: () => 'done' },
    },
  })
);

const run = (source: string, user: unknown) =>
  graphql({ schema, source, contextValue: { user } });

describe('@superAdminOnly', () => {
  it('lets an unlocked super-admin through', async () => {
    const result = await run('mutation { dangerous }', {
      _id: 'u1',
      isSuperAdmin: true,
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.dangerous).toBe('done');
  });

  it.each([
    ['a user without the flag', { _id: 'u1' }],
    ['a locked super-admin', { _id: 'u1', isSuperAdmin: true, locked: true }],
    ['the erp-admin user name alone', { _id: 'u1', username: 'erp-admin' }],
    ['no user', undefined],
  ])('refuses %s', async (_label, user) => {
    const result = await run('mutation { dangerous }', user);
    expect(result.errors?.[0].extensions?.code).toBe('FORBIDDEN');
    expect(result.data?.dangerous).toBeNull();
  });

  it('leaves fields without the directive alone', async () => {
    const result = await run('{ open }', undefined);
    expect(result.data?.open).toBe('open');
  });
});
