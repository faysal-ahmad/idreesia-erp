import { describe, expect, it } from 'vitest';
import { getDirective } from '@graphql-tools/utils';
import { makeExecutableSchema } from '@graphql-tools/schema';

import CheckCommitteeAccessSchema from '../../_directives/check-committee-access';
import DiscussionsSchema from './discussions';

const schema = makeExecutableSchema({
  typeDefs: [
    CheckCommitteeAccessSchema,
    'type Query { _placeholder: Boolean } type Mutation { _placeholder: Boolean }',
    DiscussionsSchema,
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
const READ = ['COORDINATOR', 'MEMBER', 'OBSERVER'];
const WRITE = ['COORDINATOR', 'MEMBER'];

// The role rules in docs/headless-modules/discussions-design-and-usage.md.
// Guests are not part of a committee's discussion.
const expected: Array<[Root, string, string[]]> = [
  ...[
    'workspaceDiscussionInfo',
    'workspaceDiscussionSync',
    'workspaceDiscussionThreadMessages',
    'workspaceDiscussionMembers',
    'workspaceDiscussionPinnedMessages',
    'workspaceDiscussionStarredMessages',
    'workspaceDiscussionOlderMessages',
    'workspaceDiscussionSearchMessages',
  ].map((name): [Root, string, string[]] => ['Query', name, READ]),
  ...[
    'workspaceSendDiscussionMessage',
    'workspaceReactToDiscussionMessage',
    'workspaceSetDiscussionMessageStarred',
    'workspaceEditDiscussionMessage',
    'workspaceDeleteDiscussionMessage',
  ].map((name): [Root, string, string[]] => ['Mutation', name, WRITE]),
  ['Mutation', 'workspaceSetDiscussionMessagePinned', C],
];

describe('discussions role rules', () => {
  it.each(expected)('%s %s', (root, name, roles) => {
    expect(rolesOf(root, name)).toEqual([...roles].sort());
  });

  it('covers every discussions operation, and none lets guests in', () => {
    const declared = (['Query', 'Mutation'] as Root[]).flatMap(root =>
      fieldsOf(root).map(([name]) => `${root}.${name}`)
    );
    expect(declared.sort()).toEqual(
      expected.map(([root, name]) => `${root}.${name}`).sort()
    );
    expected.forEach(([, , roles]) => expect(roles).not.toContain('GUEST'));
  });
});
