import { describe, expect, it } from 'vitest';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import {
  gqlContext,
  makeLockedUser,
  makeSuperAdmin,
  makeUser,
} from 'meteor/idreesia-common/server/test-utils/fixtures';

import CheckInstanceAccessDirective from './check-instance-access-directive';
import CheckInstanceAccessSchema from './check-instance-access';

const schema = CheckInstanceAccessDirective(
  makeExecutableSchema({
    typeDefs: [
      CheckInstanceAccessSchema,
      `
      type Page { rows: [String!]!, totalResults: Int! }
      type Query {
        one(storeId: String): String @checkInstanceAccess(instanceIdArgName: "storeId")
        list(storeId: String): [String!] @checkInstanceAccess(instanceIdArgName: "storeId", returnType: "list")
        page(storeId: String): Page @checkInstanceAccess(instanceIdArgName: "storeId", returnType: "paged-list", dataFieldName: "rows")
        noArgName: String @checkInstanceAccess(instanceIdArgName: "other")
      }
      type Mutation {
        change(storeId: String): String @checkInstanceAccess(instanceIdArgName: "storeId")
      }
    `,
    ],
    resolvers: {
      Query: {
        one: () => 'one',
        list: () => ['a'],
        page: () => ({ rows: ['a'], totalResults: 1 }),
        noArgName: () => 'x',
      },
      Mutation: { change: () => 'changed' },
    },
  })
);

const run = (source: string, user?: unknown) =>
  graphql({ schema, source, contextValue: gqlContext(user as never) });

const member = makeUser({ instances: ['s1'] });

describe('@checkInstanceAccess', () => {
  it('allows listed instances and super-admin', async () => {
    const q = '{ one(storeId: "s1") list(storeId: "s1") page(storeId: "s1") { rows } }';
    for (const user of [member, makeSuperAdmin()]) {
      const r = await run(q, user);
      expect(r.errors).toBeUndefined();
      expect(r.data?.one).toBe('one');
      expect(r.data?.list).toEqual(['a']);
    }
  });

  it('returns null / [] / empty page per returnType when denied', async () => {
    const r = await run(
      '{ one(storeId: "s2") list(storeId: "s2") page(storeId: "s2") { rows totalResults } }',
      member
    );
    expect(r.errors).toBeUndefined();
    expect(r.data).toEqual({
      one: null,
      list: [],
      page: { rows: [], totalResults: 0 },
    });
  });

  it('denies anonymous and locked users', async () => {
    for (const user of [
      undefined,
      makeLockedUser({ instances: ['s1'] }),
      makeLockedUser({ isSuperAdmin: true }),
    ]) {
      const r = await run('{ one(storeId: "s1") }', user);
      expect(r.data?.one).toBeNull();
    }
  });

  it('throws on a mutation without access, runs it with access', async () => {
    const denied = await run('mutation { change(storeId: "s2") }', member);
    expect(denied.errors?.[0].message).toMatch(/instance access/);
    const ok = await run('mutation { change(storeId: "s1") }', member);
    expect(ok.data?.change).toBe('changed');
  });

  it('throws when the instance id argument is missing', async () => {
    const r = await run('{ one }', member);
    expect(r.errors?.[0].message).toMatch(/Instance ID value not recevied/);
    const r2 = await run('{ noArgName }', member);
    expect(r2.errors?.[0].message).toMatch(/Instance ID value not recevied/);
  });
});
