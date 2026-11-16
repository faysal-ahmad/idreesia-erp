import { describe, expect, it } from 'vitest';
import { getDirective } from '@graphql-tools/utils';
import { makeExecutableSchema } from '@graphql-tools/schema';

import CheckCommitteeAccessSchema from '../../_directives/check-committee-access';
import MeetingsSchema from './meetings';

const schema = makeExecutableSchema({
  typeDefs: [
    CheckCommitteeAccessSchema,
    'type Query { _placeholder: Boolean } type Mutation { _placeholder: Boolean }',
    MeetingsSchema,
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
const ALL = ['COORDINATOR', 'GUEST', 'MEMBER', 'OBSERVER'];
const NO_GUEST = ['COORDINATOR', 'MEMBER', 'OBSERVER'];
const ACT = ['COORDINATOR', 'GUEST', 'MEMBER'];

// The role rules in docs/headless-modules/meetings-design-and-usage.md. A
// guest sees and acts only in meetings they are invited to; that part is
// checked in the resolvers (guest-access.test.ts).
const expected: Array<[Root, string, string[]]> = [
  ['Query', 'workspaceMeetingsInfo', ALL],
  ['Query', 'workspaceMeetings', ALL],
  ['Query', 'workspaceMeetingById', ALL],
  ['Query', 'workspaceMeetingAttachments', ALL],
  ['Query', 'workspaceMeetingActionItems', ALL],
  ['Query', 'workspaceMeetingMembers', NO_GUEST],
  ['Query', 'workspaceMeetingActivity', NO_GUEST],
  ['Mutation', 'workspaceMeetingAttachmentDownloadUrl', ALL],
  ['Mutation', 'workspaceRespondToMeeting', ACT],
  ['Mutation', 'workspaceSetMeetingActionItemStatus', ACT],
  ...[
    'workspaceCreateMeeting',
    'workspaceUpdateMeeting',
    'workspaceCancelMeeting',
    'workspaceCompleteMeeting',
    'workspaceReopenMeeting',
    'workspaceDeleteMeeting',
    'workspaceSetMeetingParticipants',
    'workspaceSetMeetingParticipantRole',
    'workspaceMarkMeetingAttendance',
    'workspaceAddMeetingAgendaItem',
    'workspaceUpdateMeetingAgendaItem',
    'workspaceRemoveMeetingAgendaItem',
    'workspaceReorderMeetingAgenda',
    'workspaceSetMeetingMinutes',
    'workspaceCreateMeetingAttachmentUpload',
    'workspaceCompleteMeetingAttachmentUpload',
    'workspaceAbortMeetingAttachmentUpload',
    'workspaceDeleteMeetingAttachment',
    'workspaceCreateMeetingActionItem',
    'workspaceUpdateMeetingActionItem',
    'workspaceDeleteMeetingActionItem',
  ].map((name): [Root, string, string[]] => ['Mutation', name, C]),
];

describe('meetings role rules', () => {
  it.each(expected)('%s %s', (root, name, roles) => {
    expect(rolesOf(root, name)).toEqual([...roles].sort());
  });

  it('covers every meetings operation', () => {
    const declared = (['Query', 'Mutation'] as Root[]).flatMap(root =>
      fieldsOf(root).map(([name]) => `${root}.${name}`)
    );
    expect(declared.sort()).toEqual(
      expected.map(([root, name]) => `${root}.${name}`).sort()
    );
  });
});
