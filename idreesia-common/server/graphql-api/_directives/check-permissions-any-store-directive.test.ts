import { describe, expect, it } from 'vitest';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { Permissions } from 'meteor/idreesia-common/constants';
import { PhysicalStoreAccess } from 'meteor/idreesia-common/server/collections/inventory';
import {
  gqlContext,
  makeLockedUser,
  makeUser,
} from 'meteor/idreesia-common/server/test-utils/fixtures';

import PermissionSchema from './permission';
import CheckPermissionsDirective from './check-permissions-directive';
import CheckPermissionsSchema from './check-permissions';

// A field open to HR users, and to anyone who holds a store permission on any
// store (like the karkun picker on the store forms).
const schema = CheckPermissionsDirective(
  makeExecutableSchema({
    typeDefs: [
      PermissionSchema,
      CheckPermissionsSchema,
      `
      type Query {
        picker: String @checkPermissions(permissions: [HR_VIEW_KARKUNS], anyStorePermissions: [IN_VIEW_PURCHASE_FORMS])
      }
    `,
    ],
    resolvers: { Query: { picker: () => 'picked' } },
  })
);

const run = (user?: unknown) =>
  graphql({ schema, source: '{ picker }', contextValue: gqlContext(user as never) });

const heldOnStore = (userId: string, store: string, permissions: string[]) =>
  PhysicalStoreAccess.insertAsync({
    physicalStoreId: store,
    subjectType: 'user',
    subjectId: userId,
    permissions,
  });

describe('@checkPermissions(anyStorePermissions)', () => {
  it('lets in the holder of a global permission', async () => {
    const r = await run(makeUser({ permissions: [Permissions.HR_VIEW_KARKUNS] }));
    expect(r.data?.picker).toBe('picked');
  });

  it('lets in a holder of the store permission on any store', async () => {
    await heldOnStore('u1', 'any-store', [Permissions.IN_VIEW_PURCHASE_FORMS]);
    expect((await run(makeUser())).data?.picker).toBe('picked');
  });

  it('lets in a member of a group holding it on a store', async () => {
    await PhysicalStoreAccess.insertAsync({
      physicalStoreId: 's1',
      subjectType: 'group',
      subjectId: 'g1',
      permissions: [Permissions.IN_VIEW_PURCHASE_FORMS],
    });
    expect((await run(makeUser({ groups: ['g1'] }))).data?.picker).toBe('picked');
  });

  it('refuses the wrong store permission, a global grant of it, and locked users', async () => {
    await heldOnStore('u1', 's1', [Permissions.IN_VIEW_ISSUANCE_FORMS]);
    expect((await run(makeUser())).data?.picker).toBeNull();
    expect(
      (await run(makeUser({ _id: 'u2', permissions: [Permissions.IN_VIEW_PURCHASE_FORMS] }))).data
        ?.picker
    ).toBeNull();
    await heldOnStore('u3', 's1', [Permissions.IN_VIEW_PURCHASE_FORMS]);
    expect((await run(makeLockedUser({ _id: 'u3' }))).data?.picker).toBeNull();
    expect((await run(undefined)).data?.picker).toBeNull();
  });
});
