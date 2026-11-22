import { beforeEach, describe, expect, it } from 'vitest';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import {
  OrgLocations,
  OrgLocationUsers,
} from 'meteor/idreesia-common/server/collections/admin';
import { getDutiesAttendanceAccess } from 'meteor/idreesia-common/server/graphql-api/workspaces/duties-attendance/access';

import CheckDutiesAttendanceAccessDirective from './check-duties-attendance-access-directive';
import CheckDutiesAttendanceAccessSchema from './check-duties-attendance-access';

const typeDefs = [
  CheckDutiesAttendanceAccessSchema,
  `
  type Query {
    viewing(locationId: String!): String
      @checkDutiesAttendanceAccess(permission: VIEW)
    marking(locationId: String!): String
      @checkDutiesAttendanceAccess(permission: MARK_ATTENDANCE)
    managing(locationId: String!): String
      @checkDutiesAttendanceAccess(permission: MANAGE_AND_PLAN_DUTIES)
    otherArg(id: String!): String
      @checkDutiesAttendanceAccess(permission: VIEW, locationIdArgName: "id")
    noLocation: String
      @checkDutiesAttendanceAccess(permission: VIEW)
  }
`,
];

const resolvers = {
  Query: {
    viewing: (_: unknown, args: { locationId: string }, context: any) =>
      getDutiesAttendanceAccess(context, args.locationId).locationId,
    marking: () => 'ok',
    managing: () => 'ok',
    otherArg: () => 'ok',
    noLocation: () => 'ok',
  },
};

const schema = CheckDutiesAttendanceAccessDirective(
  makeExecutableSchema({ typeDefs, resolvers })
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

const addUser = (userId: string, permissions: string[]) =>
  OrgLocationUsers.insertAsync({
    locationId,
    userId,
    permissions: permissions.map(permission => `duties-attendance.${permission}`),
  } as never);

const codeOf = (result: Awaited<ReturnType<typeof run>>) =>
  result.errors?.[0]?.extensions?.code;

describe('@checkDutiesAttendanceAccess', () => {
  it('lets a location user in with the permission and hands the access on', async () => {
    await addUser('u1', ['view', 'mark-attendance']);

    const result = await run(field('viewing'), { _id: 'u1' });

    expect(result.errors).toBeUndefined();
    expect(result.data?.viewing).toBe(locationId);
    expect((await run(field('marking'), { _id: 'u1' })).errors).toBeUndefined();
  });

  it("refuses a permission the user doesn't hold", async () => {
    await addUser('u1', ['view', 'mark-attendance']);

    expect(codeOf(await run(field('managing'), { _id: 'u1' }))).toBe('FORBIDDEN');
  });

  it('refuses people who are not users of the location, anonymous and locked callers', async () => {
    await addUser('u1', ['view']);
    await addUser('locked', ['view']);

    expect(codeOf(await run(field('viewing'), { _id: 'stranger' }))).toBe('FORBIDDEN');
    expect(codeOf(await run(field('viewing'), undefined))).toBe('FORBIDDEN');
    expect(
      codeOf(await run(field('viewing'), { _id: 'locked', locked: true }))
    ).toBe('FORBIDDEN');
    // Being a super-admin doesn't help a locked account.
    expect(
      codeOf(
        await run(field('viewing'), { _id: 'sa', isSuperAdmin: true, locked: true })
      )
    ).toBe('FORBIDDEN');
  });

  it('gives a super-admin every permission', async () => {
    const user = { _id: 'sa', isSuperAdmin: true };
    for (const name of ['viewing', 'marking', 'managing']) {
      expect((await run(field(name), user)).errors).toBeUndefined();
    }
  });

  it('refuses everyone for a location that is not a mehfil', async () => {
    const cityId = (await OrgLocations.insertAsync({
      name: 'Karachi',
      type: 'city',
    } as never)) as string;
    await OrgLocationUsers.insertAsync({
      locationId: cityId,
      userId: 'u1',
      permissions: ['duties-attendance.view'],
    } as never);
    const city = `{ viewing(locationId: "${cityId}") }`;

    expect(codeOf(await run(city, { _id: 'u1' }))).toBe('FORBIDDEN');
    expect(codeOf(await run(city, { _id: 'sa', isSuperAdmin: true }))).toBe('FORBIDDEN');
  });

  it('refuses an unknown location', async () => {
    expect(
      codeOf(
        await run('{ viewing(locationId: "nowhere") }', {
          _id: 'sa',
          isSuperAdmin: true,
        })
      )
    ).toBe('FORBIDDEN');
  });

  it('reads the location from the argument the field names', async () => {
    await addUser('u1', ['view']);

    const result = await run(`{ otherArg(id: "${locationId}") }`, { _id: 'u1' });

    expect(result.errors).toBeUndefined();
  });

  it('fails when the field has no location argument', async () => {
    const result = await run('{ noLocation }', { _id: 'u1' });

    expect(result.errors?.[0]?.message).toContain('Location ID value not received');
  });
});
