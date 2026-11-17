import { beforeEach, describe, expect, it, vi } from 'vitest';

// The committee index reaches native image code that unit tests cannot load.
// These tests need only the meetings files of it.
vi.mock('meteor/idreesia-common/server/business-logic/hr/committee', async () => ({
  ...(await import(
    'meteor/idreesia-common/server/business-logic/hr/committee/meetings'
  )),
  ...(await import(
    'meteor/idreesia-common/server/business-logic/hr/committee/meetings-view'
  )),
}));

import {
  createActionItem,
  createMeeting,
} from 'meteor/idreesia-common/server/business-logic/meetings';
import { meetingsModule } from 'meteor/idreesia-common/server/business-logic/meetings/module';
import {
  listCommitteeActionItems,
  listCommitteeMeetings,
  type CommitteeDoc,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import {
  assertActionItemInWorkspace,
  assertMeetingInWorkspace,
  guestParticipantId,
  type MeetingsAccess,
} from './access';

const HOUR = 3_600_000;

let workspaceId: string;
let invitedMeetingId: string;
let otherMeetingId: string;
let invitedItemId: string;
let otherItemId: string;

const access = (overrides: Partial<MeetingsAccess> = {}): MeetingsAccess => ({
  workspaceId,
  committee: { _id: 'c1', members: [] } as unknown as CommitteeDoc,
  userId: 'u-guest',
  personId: 'guest1',
  isCoordinator: false,
  isGuest: true,
  canJoinVideoCall: true,
  ...overrides,
});

const meeting = (title: string, participantIds: string[]) =>
  createMeeting(
    {
      workspaceId,
      title,
      startsAt: new Date(Date.now() + HOUR),
      endsAt: new Date(Date.now() + 2 * HOUR),
      participants: participantIds.map(participantId => ({ participantId })),
    },
    'u-coord'
  );

beforeEach(async () => {
  workspaceId = (
    await meetingsModule.createWorkspace({ name: 'Meetings', createdBy: 'u1' })
  ).workspaceId;
  invitedMeetingId = (await meeting('Invited', ['guest1', 'member1']))._id;
  otherMeetingId = (await meeting('Other', ['member1']))._id;
  invitedItemId = (
    await createActionItem({ meetingId: invitedMeetingId, title: 'A' }, 'u-coord')
  )._id;
  otherItemId = (
    await createActionItem({ meetingId: otherMeetingId, title: 'B' }, 'u-coord')
  )._id;
});

describe('guests in meetings', () => {
  it('narrows lists to the guest only', () => {
    expect(guestParticipantId(access())).toBe('guest1');
    expect(guestParticipantId(access({ personId: null }))).toBe('-');
    expect(guestParticipantId(access({ isGuest: false }))).toBeUndefined();
  });

  it('lists only the meetings the guest is invited to', async () => {
    const guestList = await listCommitteeMeetings(workspaceId, access(), {
      view: 'all',
      participantId: guestParticipantId(access()),
    });
    expect(guestList.data.map(({ title }) => title)).toEqual(['Invited']);

    const memberList = await listCommitteeMeetings(
      workspaceId,
      access({ isGuest: false, personId: 'member1' }),
      { view: 'all' }
    );
    expect(memberList.data.map(({ title }) => title).sort()).toEqual([
      'Invited',
      'Other',
    ]);
  });

  it('lists no meetings for a guest without a person', async () => {
    const list = await listCommitteeMeetings(
      workspaceId,
      access({ personId: null }),
      {
        view: 'all',
        participantId: guestParticipantId(access({ personId: null })),
      }
    );
    expect(list.data).toEqual([]);
  });

  it('opens a meeting only when invited', async () => {
    await expect(
      assertMeetingInWorkspace(access(), invitedMeetingId)
    ).resolves.toMatchObject({ _id: invitedMeetingId });
    await expect(
      assertMeetingInWorkspace(access(), otherMeetingId)
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
  });

  it('lets a member open a meeting they are not invited to', async () => {
    await expect(
      assertMeetingInWorkspace(access({ isGuest: false }), otherMeetingId)
    ).resolves.toMatchObject({ _id: otherMeetingId });
  });

  it('lists only action items of the meetings the guest is invited to', async () => {
    const guest = await listCommitteeActionItems(workspaceId, access(), {
      participantId: guestParticipantId(access()),
    });
    expect(guest.data.map(({ _id }) => _id)).toEqual([invitedItemId]);

    const asked = await listCommitteeActionItems(workspaceId, access(), {
      meetingId: otherMeetingId,
      participantId: guestParticipantId(access()),
    });
    expect(asked.data).toEqual([]);

    const everyone = await listCommitteeActionItems(
      workspaceId,
      access({ isGuest: false }),
      {}
    );
    expect(everyone.data.map(({ _id }) => _id).sort()).toEqual(
      [invitedItemId, otherItemId].sort()
    );
  });

  it('opens an action item only when invited to its meeting', async () => {
    await expect(
      assertActionItemInWorkspace(access(), invitedItemId)
    ).resolves.toMatchObject({ _id: invitedItemId });
    await expect(
      assertActionItemInWorkspace(access(), otherItemId)
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
  });
});
