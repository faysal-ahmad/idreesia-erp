import { beforeEach, describe, expect, it } from 'vitest';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import {
  OrgLocations,
  OrgLocationUsers,
} from 'meteor/idreesia-common/server/collections/admin';

import CheckMehfilKarkunsAccessDirective from './check-mehfil-karkuns-access-directive';
import CheckMehfilKarkunsAccessSchema from './check-mehfil-karkuns-access';

const typeDefs = [
  CheckMehfilKarkunsAccessSchema,
  `
  type Query {
    viewing(locationId: String!): String
      @checkMehfilKarkunsAccess(permission: VIEW)
  }
`,
];

const schema = CheckMehfilKarkunsAccessDirective(
  makeExecutableSchema({
    typeDefs,
    resolvers: { Query: { viewing: () => 'ok' } },
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

const field = () => `{ viewing(locationId: "${locationId}") }`;
const codeOf = (result: Awaited<ReturnType<typeof run>>) =>
  result.errors?.[0]?.extensions?.code;

describe('@checkMehfilKarkunsAccess', () => {
  it('lets a user holding view read', async () => {
    await OrgLocationUsers.insertAsync({
      locationId,
      userId: 'u1',
      permissions: ['mehfil-karkuns.view'],
    } as never);

    expect((await run(field(), { _id: 'u1' })).errors).toBeUndefined();
  });

  it('refuses strangers, anonymous and locked callers', async () => {
    await OrgLocationUsers.insertAsync({
      locationId,
      userId: 'u1',
      permissions: ['mehfil-karkuns.view'],
    } as never);

    expect(codeOf(await run(field(), { _id: 'x' }))).toBe('FORBIDDEN');
    expect(codeOf(await run(field(), undefined))).toBe('FORBIDDEN');
    expect(codeOf(await run(field(), { _id: 'u1', locked: true }))).toBe(
      'FORBIDDEN'
    );
  });

  it('does not take another feature permission as access', async () => {
    await OrgLocationUsers.insertAsync({
      locationId,
      userId: 'u1',
      permissions: ['mehfil-details.view'],
    } as never);

    expect(codeOf(await run(field(), { _id: 'u1' }))).toBe('FORBIDDEN');
  });

  it('gives a super-admin access', async () => {
    expect(
      (await run(field(), { _id: 'sa', isSuperAdmin: true })).errors
    ).toBeUndefined();
  });
});
