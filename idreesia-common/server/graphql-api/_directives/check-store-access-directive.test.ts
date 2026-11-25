import { beforeEach, describe, expect, it } from 'vitest';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { Permissions } from 'meteor/idreesia-common/constants';
import { PhysicalStoreAccess } from 'meteor/idreesia-common/server/collections/inventory';
import {
  gqlContext,
  makeLockedUser,
  makeSuperAdmin,
  makeUser,
} from 'meteor/idreesia-common/server/test-utils/fixtures';

import PermissionSchema from './permission';
import CheckStoreAccessDirective from './check-store-access-directive';
import CheckStoreAccessSchema from './check-store-access';

const schema = CheckStoreAccessDirective(
  makeExecutableSchema({
    typeDefs: [
      PermissionSchema,
      CheckStoreAccessSchema,
      `
      type Page { rows: [String!]!, totalResults: Int! }
      type Query {
        one(storeId: String): String @checkStoreAccess(permissions: [IN_VIEW_PURCHASE_FORMS, IN_MANAGE_PURCHASE_FORMS], physicalStoreIdArgName: "storeId")
        list(storeId: String): [String!] @checkStoreAccess(permissions: [IN_VIEW_PURCHASE_FORMS], physicalStoreIdArgName: "storeId", returnType: "list")
        page(storeId: String): Page @checkStoreAccess(permissions: [IN_VIEW_PURCHASE_FORMS], physicalStoreIdArgName: "storeId", returnType: "paged-list", dataFieldName: "rows")
        noArgName: String @checkStoreAccess(permissions: [IN_VIEW_PURCHASE_FORMS], physicalStoreIdArgName: "other")
      }
      type Mutation {
        change(storeId: String): String @checkStoreAccess(permissions: [IN_MANAGE_PURCHASE_FORMS], physicalStoreIdArgName: "storeId")
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

const grant = (
  subjectType: 'user' | 'group',
  subjectId: string,
  physicalStoreId: string,
  permissions: string[]
) =>
  PhysicalStoreAccess.insertAsync({
    physicalStoreId,
    subjectType,
    subjectId,
    permissions,
  });

const member = makeUser({ _id: 'u1' });

beforeEach(async () => {
  await grant('user', 'u1', 's1', [
    Permissions.IN_VIEW_PURCHASE_FORMS,
    Permissions.IN_MANAGE_PURCHASE_FORMS,
  ]);
  // Only viewing on s3: the same user, different permissions per store.
  await grant('user', 'u1', 's3', [Permissions.IN_VIEW_PURCHASE_FORMS]);
});

describe('@checkStoreAccess', () => {
  it('allows holders of the permission on the store and super-admin', async () => {
    const q = '{ one(storeId: "s1") list(storeId: "s1") page(storeId: "s1") { rows } }';
    for (const user of [member, makeSuperAdmin()]) {
      const r = await run(q, user);
      expect(r.errors).toBeUndefined();
      expect(r.data?.one).toBe('one');
      expect(r.data?.list).toEqual(['a']);
    }
  });

  it('returns null / [] / empty page per returnType on a store with no access', async () => {
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

  it('keeps permissions per store: view on one store is not manage on it', async () => {
    const view = await run('{ one(storeId: "s3") }', member);
    expect(view.data?.one).toBe('one');
    const denied = await run('mutation { change(storeId: "s3") }', member);
    expect(denied.errors?.[0].message).toMatch(/store access/);
    const ok = await run('mutation { change(storeId: "s1") }', member);
    expect(ok.data?.change).toBe('changed');
  });

  it('lets a user in through a user group they belong to', async () => {
    await grant('group', 'g1', 's2', [Permissions.IN_VIEW_PURCHASE_FORMS]);
    const inGroup = makeUser({ _id: 'u2', groups: ['g1'] });
    expect((await run('{ one(storeId: "s2") }', inGroup)).data?.one).toBe('one');
    const outside = makeUser({ _id: 'u3', groups: ['g9'] });
    expect((await run('{ one(storeId: "s2") }', outside)).data?.one).toBeNull();
  });

  it('adds up what the user and their groups hold on a store', async () => {
    await grant('group', 'g1', 's3', [Permissions.IN_MANAGE_PURCHASE_FORMS]);
    const user = makeUser({ _id: 'u1', groups: ['g1'] });
    const r = await run('mutation { change(storeId: "s3") }', user);
    expect(r.data?.change).toBe('changed');
  });

  it('denies anonymous and locked users', async () => {
    for (const user of [
      undefined,
      makeLockedUser({ _id: 'u1' }),
      makeLockedUser({ isSuperAdmin: true }),
    ]) {
      const r = await run('{ one(storeId: "s1") }', user);
      expect(r.data?.one).toBeNull();
    }
  });

  it('throws when the store id argument is missing', async () => {
    const r = await run('{ one }', member);
    expect(r.errors?.[0].message).toMatch(/Store ID value not received/);
    const r2 = await run('{ noArgName }', member);
    expect(r2.errors?.[0].message).toMatch(/Store ID value not received/);
  });
});
