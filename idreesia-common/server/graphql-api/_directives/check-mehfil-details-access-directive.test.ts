import { beforeEach, describe, expect, it } from 'vitest';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import {
  OrgLocations,
  OrgLocationUsers,
} from 'meteor/idreesia-common/server/collections/admin';

import CheckMehfilDetailsAccessDirective from './check-mehfil-details-access-directive';
import CheckMehfilDetailsAccessSchema from './check-mehfil-details-access';

const typeDefs = [
  CheckMehfilDetailsAccessSchema,
  `
  type Query {
    viewing(locationId: String!): String
      @checkMehfilDetailsAccess(permission: VIEW)
    updating(locationId: String!): String
      @checkMehfilDetailsAccess(permission: UPDATE)
  }
`,
];

const schema = CheckMehfilDetailsAccessDirective(
  makeExecutableSchema({
    typeDefs,
    resolvers: { Query: { viewing: () => 'ok', updating: () => 'ok' } },
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
    permissions: permissions.map(permission => `mehfil-details.${permission}`),
  } as never);

describe('@checkMehfilDetailsAccess', () => {
  it('lets a viewer read but not update', async () => {
    await addUser('u1', ['view']);

    expect((await run(field('viewing'), { _id: 'u1' })).errors).toBeUndefined();
    expect(codeOf(await run(field('updating'), { _id: 'u1' }))).toBe('FORBIDDEN');
  });

  it('lets a user with both permissions do both', async () => {
    await addUser('u1', ['view', 'update']);

    expect((await run(field('viewing'), { _id: 'u1' })).errors).toBeUndefined();
    expect((await run(field('updating'), { _id: 'u1' })).errors).toBeUndefined();
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
    expect((await run(field('updating'), user)).errors).toBeUndefined();
  });
});
