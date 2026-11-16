import { describe, expect, it } from 'vitest';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { Permissions } from 'meteor/idreesia-common/constants';
import {
  gqlContext,
  makeLockedUser,
  makeSuperAdmin,
  makeUser,
} from 'meteor/idreesia-common/server/test-utils/fixtures';

import CheckPermissionsDirective from './check-permissions-directive';
import CheckPermissionsSchema from './check-permissions';
import PermissionSchema from './permission';

const [P1, P2] = ['ADMIN_VIEW_USERS_AND_GROUPS', 'ADMIN_MANAGE_USERS_AND_GROUPS'];
const perm = (name: string) =>
  (Permissions as Record<string, string>)[name];

const schema = CheckPermissionsDirective(
  makeExecutableSchema({
    typeDefs: [
      CheckPermissionsSchema,
      PermissionSchema,
      `
      type Page { items: [String!]!, data: [String!]!, totalResults: Int! }
      type Query {
        single: String @checkPermissions(permissions: [${P1}, ${P2}])
        many: [String!] @checkPermissions(permissions: [${P1}])
        pagedThings: Page @checkPermissions(permissions: [${P1}])
        pagedCustom: Page @checkPermissions(permissions: [${P1}], dataFieldName: "items")
        nobody: String @checkPermissions(permissions: [])
        open: String
      }
      type Mutation {
        change: String @checkPermissions(permissions: [${P2}])
      }
    `,
    ],
    resolvers: {
      Query: {
        single: () => 's',
        many: () => ['a'],
        pagedThings: () => ({ data: ['a'], items: [], totalResults: 1 }),
        pagedCustom: () => ({ data: [], items: ['a'], totalResults: 1 }),
        nobody: () => 'n',
        open: () => 'o',
      },
      Mutation: { change: () => 'changed' },
    },
  })
);

const run = (source: string, user?: unknown) =>
  graphql({ schema, source, contextValue: gqlContext(user as never) });

describe('@checkPermissions', () => {
  it('allows a user holding any one listed permission', async () => {
    for (const p of [P1, P2]) {
      const r = await run('{ single }', makeUser({ permissions: [perm(p)] }));
      expect(r.data?.single).toBe('s');
    }
  });

  it('allows a super-admin everywhere, including an empty permission list', async () => {
    const r = await run('{ single nobody }', makeSuperAdmin());
    expect(r.data).toEqual({ single: 's', nobody: 'n' });
  });

  it('denies a user with an unrelated permission, null for a plain query', async () => {
    const user = makeUser({ permissions: ['SOMETHING_ELSE'] });
    const r = await run('{ single many }', user);
    expect(r.errors).toBeUndefined();
    expect(r.data).toEqual({ single: null, many: null });
  });

  it('denies anonymous and locked users (even locked super-admin / with permission)', async () => {
    for (const user of [
      undefined,
      makeLockedUser({ permissions: [perm(P1)] }),
      makeLockedUser({ isSuperAdmin: true }),
    ]) {
      const r = await run('{ single }', user);
      expect(r.data?.single).toBeNull();
    }
  });

  it('returns an empty page for paged* queries, using data by default', async () => {
    const r = await run('{ pagedThings { data totalResults } }', makeUser());
    expect(r.data?.pagedThings).toEqual({ data: [], totalResults: 0 });
  });

  it('honours dataFieldName for the empty page', async () => {
    const r = await run('{ pagedCustom { items totalResults } }', makeUser());
    expect(r.data?.pagedCustom).toEqual({ items: [], totalResults: 0 });
  });

  it('throws on a mutation without permission and runs it with permission', async () => {
    const denied = await run('mutation { change }', makeUser());
    expect(denied.errors?.[0].message).toMatch(/required permissions/);
    expect(denied.data?.change).toBeNull();

    const allowed = await run(
      'mutation { change }',
      makeUser({ permissions: [perm(P2)] })
    );
    expect(allowed.data?.change).toBe('changed');
  });

  it('leaves undecorated fields alone', async () => {
    const r = await run('{ open }');
    expect(r.data?.open).toBe('o');
  });

  it('every Permission enum name has a constant, and vice versa', () => {
    const enumNames = [...PermissionSchema.loc!.source.body.matchAll(/^\s+([A-Z][A-Z_]+)\s*$/gm)].map(
      m => m[1]
    );
    const constantNames = Object.keys(Permissions);
    expect(enumNames.filter(n => !perm(n))).toEqual([]);
    expect(constantNames.filter(n => !enumNames.includes(n))).toEqual([]);
  });
});
