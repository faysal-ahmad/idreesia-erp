import { beforeEach, describe, expect, it } from 'vitest';
import { graphql } from 'graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { Committees } from 'meteor/idreesia-common/server/collections/hr';
import { getCommitteeAccess } from 'meteor/idreesia-common/server/graphql-api/workspaces/committee/access';

import CheckCommitteeAccessDirective from './check-committee-access-directive';
import CheckCommitteeAccessSchema from './check-committee-access';

const typeDefs = [
  CheckCommitteeAccessSchema,
  `
  type Query {
    anyRole(committeeId: String!): String
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, GUEST, OBSERVER])
    readers(committeeId: String!): String
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
    voters(committeeId: String!): String
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
    coordinatorsOnly(committeeId: String!): String
      @checkCommitteeAccess(roles: [COORDINATOR])
    otherArg(id: String!): String
      @checkCommitteeAccess(roles: [COORDINATOR], committeeIdArgName: "id")
    twoCommittees(first: String!, second: String!): String
  }
`,
];

const resolvers = {
  Query: {
    anyRole: (_: unknown, args: { committeeId: string }, context: any) =>
      getCommitteeAccess(context, args.committeeId).role,
    readers: () => 'ok',
    voters: () => 'ok',
    coordinatorsOnly: () => 'ok',
    otherArg: () => 'ok',
  },
};

const schema = CheckCommitteeAccessDirective(
  makeExecutableSchema({ typeDefs, resolvers })
);

const run = (source: string, user: unknown, context: Record<string, unknown> = {}) =>
  graphql({ schema, source, contextValue: { user, ...context } });

const roleUser = (personId: string, extra: Record<string, unknown> = {}) => ({
  _id: `user-${personId}`,
  personId,
  ...extra,
});

let committeeId: string;

beforeEach(async () => {
  committeeId = (await Committees.insertAsync({
    name: 'Committee',
    members: [
      { karkunId: 'coordinator', role: 'coordinator' },
      { karkunId: 'member', role: 'member' },
      { karkunId: 'noRole' },
      { karkunId: 'observer', role: 'observer' },
      { karkunId: 'guest', role: 'guest' },
    ],
  } as never)) as string;
});

const field = (name: string) => `{ ${name}(committeeId: "${committeeId}") }`;

describe('@checkCommitteeAccess', () => {
  it.each([
    ['anyRole', ['coordinator', 'member', 'noRole', 'observer', 'guest']],
    ['readers', ['coordinator', 'member', 'noRole', 'observer']],
    ['voters', ['coordinator', 'member', 'noRole']],
    ['coordinatorsOnly', ['coordinator']],
  ])('%s allows exactly the listed roles', async (name, allowed) => {
    const everyone = ['coordinator', 'member', 'noRole', 'observer', 'guest'];
    for (const personId of everyone) {
      const result = await run(field(name), roleUser(personId));
      if (allowed.includes(personId)) {
        expect(result.errors, `${name}/${personId}`).toBeUndefined();
        expect(result.data?.[name]).toBeTruthy();
      } else {
        expect(result.errors?.[0].extensions?.code, `${name}/${personId}`).toBe(
          'FORBIDDEN'
        );
      }
    }
  });

  it('records the caller role and coordinator flag for the resolver', async () => {
    const guest = await run(field('anyRole'), roleUser('guest'));
    expect(guest.data?.anyRole).toBe('guest');
    const none = await run(field('anyRole'), roleUser('noRole'));
    expect(none.data?.anyRole).toBe('member');
  });

  it('keeps the access of each committee on the context apart', async () => {
    const otherId = (await Committees.insertAsync({
      name: 'Other',
      members: [{ karkunId: 'member', role: 'observer' }],
    } as never)) as string;
    const context: Record<string, unknown> = {};
    const user = roleUser('member');
    const first = await run(field('anyRole'), user, context);
    const second = await run(
      `{ anyRole(committeeId: "${otherId}") }`,
      user,
      context
    );
    expect(first.data?.anyRole).toBe('member');
    expect(second.data?.anyRole).toBe('observer');
  });

  it('refuses people who are not on the committee', async () => {
    const result = await run(field('anyRole'), roleUser('stranger'));
    expect(result.errors?.[0].extensions?.code).toBe('FORBIDDEN');
    expect(result.errors?.[0].message).toMatch(/not a member/);
  });

  it('refuses an unknown committee', async () => {
    const result = await run(
      '{ anyRole(committeeId: "nope") }',
      roleUser('coordinator')
    );
    expect(result.errors?.[0].extensions?.code).toBe('FORBIDDEN');
  });

  it('refuses a user without a person or a locked user', async () => {
    const noPerson = await run(field('anyRole'), { _id: 'u1' });
    expect(noPerson.errors?.[0].extensions?.code).toBe('FORBIDDEN');
    const locked = await run(
      field('anyRole'),
      roleUser('coordinator', { locked: true })
    );
    expect(locked.errors?.[0].extensions?.code).toBe('FORBIDDEN');
  });

  it('refuses a caller who is not logged in', async () => {
    const result = await run(field('anyRole'), undefined);
    expect(result.errors?.[0].extensions?.code).toBe('FORBIDDEN');
  });

  it('lets a super-admin through as a coordinator, even off the committee', async () => {
    const admin = { _id: 'admin', isSuperAdmin: true };
    const result = await run(field('coordinatorsOnly'), admin);
    expect(result.errors).toBeUndefined();
    const role = await run(field('anyRole'), admin);
    expect(role.data?.anyRole).toBe('coordinator');
  });

  it('gives a locked super-admin nothing', async () => {
    const result = await run(field('anyRole'), {
      _id: 'admin',
      isSuperAdmin: true,
      locked: true,
    });
    expect(result.errors?.[0].extensions?.code).toBe('FORBIDDEN');
  });

  it('reads the committee id from the configured argument', async () => {
    const result = await run(
      `{ otherArg(id: "${committeeId}") }`,
      roleUser('coordinator')
    );
    expect(result.errors).toBeUndefined();
    const denied = await run(
      `{ otherArg(id: "${committeeId}") }`,
      roleUser('member')
    );
    expect(denied.errors?.[0].extensions?.code).toBe('FORBIDDEN');
  });
});

describe('getCommitteeAccess', () => {
  it('throws when the field did not carry the directive', () => {
    expect(() => getCommitteeAccess({ user: roleUser('member') }, 'c1')).toThrow(
      /@checkCommitteeAccess/
    );
  });
});
