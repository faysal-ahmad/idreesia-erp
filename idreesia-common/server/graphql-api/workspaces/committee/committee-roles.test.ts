import { describe, expect, it } from 'vitest';
import { getDirective } from '@graphql-tools/utils';
import { makeExecutableSchema } from '@graphql-tools/schema';

import CheckCommitteeAccessSchema from '../../_directives/check-committee-access';
import CommitteeSchema from './committee';

const schema = makeExecutableSchema({
  typeDefs: [
    CheckCommitteeAccessSchema,
    'type Query { _placeholder: Boolean } type Mutation { _placeholder: Boolean }',
    CommitteeSchema,
  ],
});

type Root = 'Query' | 'Mutation';

const fieldsOf = (root: Root) =>
  Object.entries(
    (root === 'Query' ? schema.getQueryType() : schema.getMutationType())!.getFields()
  ).filter(([name]) => name !== '_placeholder');

const rolesOf = (root: Root, name: string) => {
  const field = fieldsOf(root).find(([n]) => n === name)![1];
  const directive = getDirective(schema, field, 'checkCommitteeAccess')?.[0];
  return directive ? [...(directive.roles as string[])].sort() : undefined;
};

const C = ['COORDINATOR'];
const ANY = ['COORDINATOR', 'GUEST', 'MEMBER', 'OBSERVER'];

// myCommittees has no committee id: it lists the caller's own committees.
const expected: Array<[Root, string, string[] | undefined]> = [
  ['Query', 'myCommittees', undefined],
  ['Query', 'myCommitteeLocations', undefined],
  ['Query', 'workspaceCommitteeById', ANY],
  ['Query', 'workspaceCommitteeKarkunSearch', C],
  ['Mutation', 'workspaceAddCommitteeMember', C],
  ['Mutation', 'workspaceRemoveCommitteeMember', C],
  ['Mutation', 'workspaceSetCommitteeMemberDiscussionAccess', C],
  ['Mutation', 'workspaceSetCommitteeMemberCoordinator', C],
];

describe('committee role rules', () => {
  it.each(expected)('%s %s', (root, name, roles) => {
    expect(rolesOf(root, name)).toEqual(roles && [...roles].sort());
  });

  it('covers every committee operation', () => {
    const declared = (['Query', 'Mutation'] as Root[]).flatMap(root =>
      fieldsOf(root).map(([name]) => `${root}.${name}`)
    );
    expect(declared.sort()).toEqual(
      expected.map(([root, name]) => `${root}.${name}`).sort()
    );
  });
});
