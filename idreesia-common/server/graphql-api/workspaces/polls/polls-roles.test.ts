import { describe, expect, it } from 'vitest';
import { getDirective } from '@graphql-tools/utils';
import { makeExecutableSchema } from '@graphql-tools/schema';

import CheckCommitteeAccessSchema from '../../_directives/check-committee-access';
import PollsSchema from './polls';

const schema = makeExecutableSchema({
  typeDefs: [
    CheckCommitteeAccessSchema,
    'type Query { _placeholder: Boolean } type Mutation { _placeholder: Boolean }',
    PollsSchema,
  ],
});

const rolesOf = (root: 'Query' | 'Mutation', name: string) => {
  const type = root === 'Query' ? schema.getQueryType() : schema.getMutationType();
  const field = type!.getFields()[name];
  const directive = getDirective(schema, field, 'checkCommitteeAccess')?.[0];
  return directive ? [...(directive.roles as string[])].sort() : undefined;
};

const COORDINATOR_ONLY = ['COORDINATOR'];
const VIEWERS = ['COORDINATOR', 'MEMBER', 'OBSERVER'];
const VOTERS = ['COORDINATOR', 'MEMBER'];

// The role rules in docs/headless-modules/polls-design-and-usage.md. Guests
// have no access to polls.
const expected: Array<['Query' | 'Mutation', string, string[]]> = [
  ['Query', 'workspacePollsInfo', VIEWERS],
  ['Query', 'workspacePolls', VIEWERS],
  ['Query', 'workspacePollById', VIEWERS],
  ['Query', 'workspacePollResults', VIEWERS],
  ['Query', 'workspacePollActivity', COORDINATOR_ONLY],
  ['Mutation', 'workspaceCreatePoll', COORDINATOR_ONLY],
  ['Mutation', 'workspaceUpdatePoll', COORDINATOR_ONLY],
  ['Mutation', 'workspaceOpenPoll', COORDINATOR_ONLY],
  ['Mutation', 'workspaceClosePoll', COORDINATOR_ONLY],
  ['Mutation', 'workspaceReopenPoll', COORDINATOR_ONLY],
  ['Mutation', 'workspaceCancelPoll', COORDINATOR_ONLY],
  ['Mutation', 'workspaceDeletePoll', COORDINATOR_ONLY],
  ['Mutation', 'workspaceCastPollVote', VOTERS],
  ['Mutation', 'workspaceWithdrawPollVote', VOTERS],
];

describe('polls role rules', () => {
  it.each(expected)('%s %s', (root, name, roles) => {
    expect(rolesOf(root, name)).toEqual([...roles].sort());
  });

  it('covers every polls operation, and no operation lets guests in', () => {
    const declared = ['Query', 'Mutation'].flatMap(root => {
      const type =
        root === 'Query' ? schema.getQueryType() : schema.getMutationType();
      return Object.keys(type!.getFields())
        .filter(name => name.startsWith('workspacePoll') || name.endsWith('Poll') || name.endsWith('PollVote'))
        .map(name => `${root}.${name}`);
    });
    expect(declared.sort()).toEqual(
      expected.map(([root, name]) => `${root}.${name}`).sort()
    );
    expected.forEach(([, , roles]) => expect(roles).not.toContain('GUEST'));
  });
});
