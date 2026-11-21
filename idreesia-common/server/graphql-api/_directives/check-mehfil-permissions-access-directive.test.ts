import { beforeEach, describe, expect, it } from 'vitest';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import {
  OrgLocations,
  OrgLocationUsers,
} from 'meteor/idreesia-common/server/collections/admin';

import CheckMehfilPermissionsAccessDirective from './check-mehfil-permissions-access-directive';
import CheckMehfilPermissionsAccessSchema from './check-mehfil-permissions-access';

const typeDefs = [
  CheckMehfilPermissionsAccessSchema,
  `
  type Query {
    viewing(locationId: String!): String
      @checkMehfilPermissionsAccess(permission: VIEW)
    managing(locationId: String!): String
      @checkMehfilPermissionsAccess(permission: MANAGE)
  }
`,
];

const schema = CheckMehfilPermissionsAccessDirective(
  makeExecutableSchema({
    typeDefs,
    resolvers: { Query: { viewing: () => 'ok', managing: () => 'ok' } },
  })
);

const run = (source: string, user: unknown) =>
  graphql({ schema, source, contextValue: { user } });

let locationId: string;

beforeEach(async () => {
  locationId = (await OrgLocations.insertAsync({
    name: 'Mehfil',
    type: 'mehfil',
  } as never)) as string;
});

const field = (name: string) => `{ ${name}(locationId: "${locationId}") }`;
const codeOf = (result: Awaited<ReturnType<typeof run>>) =>
  result.errors?.[0]?.extensions?.code;

const addUser = (userId: string, permissions: string[]) =>
  OrgLocationUsers.insertAsync({
    locationId,
    userId,
    permissions: permissions.map(permission => `mehfil-permissions.${permission}`),
  } as never);

describe('@checkMehfilPermissionsAccess', () => {
  it('lets a viewer read but not manage', async () => {
    await addUser('u1', ['view']);

    expect((await run(field('viewing'), { _id: 'u1' })).errors).toBeUndefined();
    expect(codeOf(await run(field('managing'), { _id: 'u1' }))).toBe('FORBIDDEN');
  });

  it('lets a user with both permissions do both', async () => {
    await addUser('u1', ['view', 'manage']);

    expect((await run(field('viewing'), { _id: 'u1' })).errors).toBeUndefined();
    expect((await run(field('managing'), { _id: 'u1' })).errors).toBeUndefined();
  });

  it('refuses strangers, anonymous and locked callers', async () => {
    await addUser('u1', ['view']);

    expect(codeOf(await run(field('viewing'), { _id: 'x' }))).toBe('FORBIDDEN');
    expect(codeOf(await run(field('viewing'), undefined))).toBe('FORBIDDEN');
    expect(
      codeOf(await run(field('viewing'), { _id: 'u1', locked: true }))
    ).toBe('FORBIDDEN');
  });

  it('gives a super-admin every permission', async () => {
    const user = { _id: 'sa', isSuperAdmin: true };
    expect((await run(field('viewing'), user)).errors).toBeUndefined();
    expect((await run(field('managing'), user)).errors).toBeUndefined();
  });
});
