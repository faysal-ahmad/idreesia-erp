import { beforeEach, describe, expect, it } from 'vitest';

import {
  MeetingActionItems,
  Meetings,
  MeetingsActivities,
} from 'meteor/idreesia-common/server/collections/meetings';

import {
  addAgendaItem,
  addParticipants,
  cancelMeeting,
  completeMeeting,
  createActionItem,
  createMeeting,
  createMeetingsWorkspace,
  deleteActionItem,
  deleteMeeting,
  getActionItem,
  getMeeting,
  listActionItems,
  listMeetings,
  listParticipantMeetings,
  markAttendance,
  removeAgendaItem,
  removeParticipant,
  reopenMeeting,
  reorderAgenda,
  respondToInvitation,
  setActionItemStatus,
  setMinutes,
  setParticipantRole,
  updateActionItem,
  updateAgendaItem,
  updateMeeting,
} from './index';

const HOUR = 60 * 60 * 1000;
const future = new Date(Date.now() + 24 * HOUR);
const past = new Date(Date.now() - 3 * HOUR);

let workspaceId: string;

beforeEach(async () => {
  workspaceId = (await createMeetingsWorkspace({ name: 'W' }, 'u1'))._id;
});

const schedule = (extra: Record<string, unknown> = {}) =>
  createMeeting(
    {
      workspaceId,
      title: 'Board',
      startsAt: future,
      endsAt: new Date(future.getTime() + HOUR),
      participants: [{ participantId: 'p1' }, { participantId: 'p2', role: 'optional' }],
      ...extra,
    } as any,
    'u1'
  );

/** A meeting that has already started (so it can be completed / attended). */
const started = () =>
  schedule({ startsAt: past, endsAt: new Date(past.getTime() + HOUR) });

const rejectsWith = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject({ extensions: { code } });
};

const actions = async (meetingId: string) =>
  (await MeetingsActivities.find({ meetingId }, { sort: { at: 1 } }).fetchAsync()).map(
    (a: any) => a.action
  );

describe('meeting state transitions', () => {
  it('creates a scheduled meeting with pending invitations and logs it', async () => {
    const meeting = await schedule();
    expect(meeting.status).toBe('scheduled');
    expect(meeting.participants.map(p => p.rsvp.status)).toEqual(['pending', 'pending']);
    expect(meeting.participants[0].role).toBe('required');
    expect(await actions(meeting._id)).toEqual(['meeting-created']);
  });

  it('rejects bad times, time zone, url and duplicate participants', async () => {
    await rejectsWith(
      schedule({ endsAt: new Date(future.getTime() - HOUR) }),
      'BAD_USER_INPUT'
    );
    await rejectsWith(schedule({ timeZone: 'Mars/Base' }), 'BAD_USER_INPUT');
    await rejectsWith(schedule({ onlineUrl: 'ftp://example.com/x' }), 'BAD_USER_INPUT');
    await rejectsWith(
      schedule({ participants: [{ participantId: 'p1' }, { participantId: 'p1' }] }),
      'CONFLICT'
    );
    await rejectsWith(schedule({ title: '' }), 'BAD_USER_INPUT');
  });

  it('cancels a scheduled meeting with a reason and makes it read-only', async () => {
    const meeting = await schedule();
    const cancelled = await cancelMeeting(meeting._id, 'u2', { reason: ' clash ' });
    expect(cancelled).toMatchObject({
      status: 'cancelled',
      cancelledBy: 'u2',
      cancellationReason: 'clash',
    });
    await rejectsWith(cancelMeeting(meeting._id, 'u1'), 'CONFLICT');
    await rejectsWith(completeMeeting(meeting._id, 'u1'), 'CONFLICT');
    await rejectsWith(updateMeeting(meeting._id, { title: 'X' }, 'u1'), 'CONFLICT');
    await rejectsWith(setMinutes(meeting._id, 'text', 'u1'), 'CONFLICT');
    await rejectsWith(addParticipants(meeting._id, [{ participantId: 'p9' }], 'u1'), 'CONFLICT');
    await rejectsWith(addAgendaItem(meeting._id, { title: 'A' }, 'u1'), 'CONFLICT');
    await rejectsWith(createActionItem({ meetingId: meeting._id, title: 'A' }, 'u1'), 'CONFLICT');
    expect(await actions(meeting._id)).toEqual(['meeting-created', 'meeting-cancelled']);
  });

  it("can't complete a meeting before it starts, but can once started", async () => {
    const later = await schedule();
    await rejectsWith(completeMeeting(later._id, 'u1'), 'CONFLICT');
    const meeting = await started();
    const done = await completeMeeting(meeting._id, 'u2');
    expect(done).toMatchObject({ status: 'completed', completedBy: 'u2' });
    await rejectsWith(completeMeeting(meeting._id, 'u1'), 'CONFLICT');
    await rejectsWith(cancelMeeting(meeting._id, 'u1'), 'CONFLICT');
  });

  it('reopens cancelled and completed meetings, clearing their state; scheduled ones cannot be reopened', async () => {
    const meeting = await started();
    await rejectsWith(reopenMeeting(meeting._id, 'u1'), 'CONFLICT');
    await completeMeeting(meeting._id, 'u1');
    const reopened = await reopenMeeting(meeting._id, 'u1');
    expect(reopened.status).toBe('scheduled');
    expect(reopened.completedAt).toBeUndefined();
    await cancelMeeting(meeting._id, 'u1', { reason: 'r' });
    const again = await reopenMeeting(meeting._id, 'u1');
    expect(again.cancellationReason).toBeUndefined();
    expect(again.cancelledBy).toBeUndefined();
  });

  it('allows detail edits on a completed meeting but not rescheduling', async () => {
    const meeting = await started();
    await completeMeeting(meeting._id, 'u1');
    const updated = await updateMeeting(meeting._id, { location: 'Hall' }, 'u1');
    expect(updated.location).toBe('Hall');
    await rejectsWith(
      updateMeeting(meeting._id, { startsAt: future, endsAt: new Date(future.getTime() + HOUR) }, 'u1'),
      'CONFLICT'
    );
  });

  it('logs reschedules and updates separately, and validates the new times', async () => {
    const meeting = await schedule();
    await rejectsWith(updateMeeting(meeting._id, { endsAt: new Date(0) }, 'u1'), 'BAD_USER_INPUT');
    const to = new Date(future.getTime() + 2 * HOUR);
    const updated = await updateMeeting(
      meeting._id,
      { startsAt: to, endsAt: new Date(to.getTime() + HOUR), title: 'Board 2' },
      'u1'
    );
    expect(updated.startsAt.getTime()).toBe(to.getTime());
    expect(await actions(meeting._id)).toEqual([
      'meeting-created',
      'meeting-rescheduled',
      'meeting-updated',
    ]);
    const updatedEntry = (await MeetingsActivities.findOneAsync({
      action: 'meeting-updated',
    })) as any;
    expect(updatedEntry.details.changed).toEqual(['title']);
  });

  it('clears optional fields with null', async () => {
    const meeting = await schedule({ location: 'Hall', description: 'd' });
    const updated = await updateMeeting(meeting._id, { location: null, description: null }, 'u1');
    expect(updated.location).toBeUndefined();
    expect(updated.description).toBeUndefined();
  });

  it('deletes a meeting with its action items, keeping the activity', async () => {
    const meeting = await schedule();
    await createActionItem({ meetingId: meeting._id, title: 'A' }, 'u1');
    await deleteMeeting(meeting._id, 'u1');
    expect(await Meetings.find({}).countAsync()).toBe(0);
    expect(await MeetingActionItems.find({}).countAsync()).toBe(0);
    expect(await actions(meeting._id)).toContain('meeting-deleted');
    await rejectsWith(getMeeting(meeting._id, 'u1'), 'NOT_FOUND');
  });

  it('requires a user id', async () => {
    const meeting = await schedule();
    await rejectsWith(cancelMeeting(meeting._id, ''), 'BAD_USER_INPUT');
  });
});

describe('listing meetings', () => {
  it('filters by status, participant, time range and sorts by start time', async () => {
    const soon = await schedule({ title: 'Soon' });
    const done = await started();
    await completeMeeting(done._id, 'u1');
    await schedule({
      title: 'Other',
      participants: [{ participantId: 'p3' }],
      startsAt: new Date(future.getTime() + 48 * HOUR),
      endsAt: new Date(future.getTime() + 49 * HOUR),
    });

    const titles = async (o: any) => (await listMeetings(workspaceId, 'u1', o)).data.map(m => m.title);
    expect(await titles({ status: 'completed' })).toEqual(['Board']);
    expect(await titles({ participantId: 'p3' })).toEqual(['Other']);
    expect((await titles({ sortOrder: 'desc' }))[0]).toBe('Other');
    expect(await titles({ from: new Date(), to: new Date(future.getTime() + HOUR) })).toEqual([
      'Soon',
    ]);
    expect(soon.title).toBe('Soon');
    await rejectsWith(listMeetings(workspaceId, 'u1', { status: 'x' as any }), 'BAD_USER_INPUT');
    await rejectsWith(listMeetings('nope', 'u1'), 'NOT_FOUND');
  });

  it('lists a participant\'s meetings by RSVP, limited to authorised workspaces', async () => {
    const other = (await createMeetingsWorkspace({ name: 'W2' }, 'u1'))._id;
    const a = await schedule();
    await respondToInvitation(a._id, 'p1', { status: 'accepted' }, 'u1');
    await createMeeting(
      {
        workspaceId: other,
        title: 'B',
        startsAt: future,
        endsAt: new Date(future.getTime() + HOUR),
        participants: [{ participantId: 'p1' }],
      },
      'u1'
    );
    expect((await listParticipantMeetings('p1', 'u1')).totalResults).toBe(2);
    expect(
      (await listParticipantMeetings('p1', 'u1', { workspaceIds: [workspaceId] })).data.map(
        m => m._id
      )
    ).toEqual([a._id]);
    expect(
      (await listParticipantMeetings('p1', 'u1', { rsvpStatus: ['accepted'] })).data.map(
        m => m._id
      )
    ).toEqual([a._id]);
    await rejectsWith(
      listParticipantMeetings('p1', 'u1', { rsvpStatus: 'maybe-ish' as any }),
      'BAD_USER_INPUT'
    );
  });
});

describe('participants', () => {
  it('adds participants, refusing duplicates, and logs the new ids only', async () => {
    const meeting = await schedule();
    await rejectsWith(addParticipants(meeting._id, [{ participantId: 'p1' }], 'u1'), 'CONFLICT');
    const updated = await addParticipants(meeting._id, [{ participantId: 'p3' }], 'u1');
    expect(updated.participants).toHaveLength(3);
    const entry = (await MeetingsActivities.findOneAsync({
      action: 'participants-added',
    })) as any;
    expect(entry.details.participantIds).toEqual(['p3']);
    const same = await addParticipants(meeting._id, [], 'u1');
    expect(same.revision).toBe(updated.revision);
  });

  it('removes a participant, and fails for strangers', async () => {
    const meeting = await schedule();
    const updated = await removeParticipant(meeting._id, 'p2', 'u1');
    expect(updated.participants.map(p => p.participantId)).toEqual(['p1']);
    await rejectsWith(removeParticipant(meeting._id, 'p2', 'u1'), 'NOT_FOUND');
  });

  it('changes a role, ignoring a no-op and rejecting unknown roles', async () => {
    const meeting = await schedule();
    const unchanged = await setParticipantRole(meeting._id, 'p1', 'required', 'u1');
    expect(unchanged.revision).toBe(meeting.revision);
    const updated = await setParticipantRole(meeting._id, 'p1', 'optional', 'u1');
    expect(updated.participants[0].role).toBe('optional');
    await rejectsWith(setParticipantRole(meeting._id, 'p1', 'boss' as any, 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(setParticipantRole(meeting._id, 'p9', 'optional', 'u1'), 'NOT_FOUND');
  });

  it('records RSVPs with comment and time, and pending clears the time', async () => {
    const meeting = await schedule();
    const accepted = await respondToInvitation(
      meeting._id,
      'p1',
      { status: 'declined', comment: ' away ' },
      'u1'
    );
    const rsvp = accepted.participants[0].rsvp;
    expect(rsvp).toMatchObject({ status: 'declined', comment: 'away' });
    expect(rsvp.respondedAt).toBeInstanceOf(Date);
    const reset = await respondToInvitation(meeting._id, 'p1', { status: 'pending' }, 'u1');
    expect(reset.participants[0].rsvp.respondedAt).toBeUndefined();
    await rejectsWith(
      respondToInvitation(meeting._id, 'p1', { status: 'x' as any }, 'u1'),
      'BAD_USER_INPUT'
    );
  });

  it('only accepts RSVPs and roster changes while scheduled', async () => {
    const meeting = await started();
    await completeMeeting(meeting._id, 'u1');
    await rejectsWith(respondToInvitation(meeting._id, 'p1', { status: 'accepted' }, 'u1'), 'CONFLICT');
    await rejectsWith(removeParticipant(meeting._id, 'p1', 'u1'), 'CONFLICT');
    await rejectsWith(setParticipantRole(meeting._id, 'p1', 'optional', 'u1'), 'CONFLICT');
  });

  it('marks attendance only after the meeting starts', async () => {
    const later = await schedule();
    await rejectsWith(
      markAttendance(later._id, [{ participantId: 'p1', status: 'present' }], 'u1'),
      'CONFLICT'
    );
  });

  it('marks, annotates, clears attendance and rejects bad entries', async () => {
    const meeting = await started();
    const marked = await markAttendance(
      meeting._id,
      [
        { participantId: 'p1', status: 'present', note: 'on time' },
        { participantId: 'p2', status: 'absent' },
      ],
      'u2'
    );
    expect(marked.participants[0].attendance).toMatchObject({
      status: 'present',
      note: 'on time',
      markedBy: 'u2',
    });
    const cleared = await markAttendance(meeting._id, [{ participantId: 'p1', status: null }], 'u2');
    expect(cleared.participants[0].attendance).toBeUndefined();
    expect(cleared.participants[1].attendance?.status).toBe('absent');

    await rejectsWith(markAttendance(meeting._id, [], 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(
      markAttendance(
        meeting._id,
        [
          { participantId: 'p1', status: 'present' },
          { participantId: 'p1', status: 'absent' },
        ],
        'u1'
      ),
      'BAD_USER_INPUT'
    );
    await rejectsWith(
      markAttendance(meeting._id, [{ participantId: 'p9', status: 'present' }], 'u1'),
      'NOT_FOUND'
    );
    await rejectsWith(
      markAttendance(meeting._id, [{ participantId: 'p1', status: 'hmm' as any }], 'u1'),
      'BAD_USER_INPUT'
    );
  });

  it('allows attendance on a completed meeting but not a cancelled one', async () => {
    const meeting = await started();
    await completeMeeting(meeting._id, 'u1');
    await expect(
      markAttendance(meeting._id, [{ participantId: 'p1', status: 'present' }], 'u1')
    ).resolves.toBeDefined();
    const other = await started();
    await cancelMeeting(other._id, 'u1');
    await rejectsWith(
      markAttendance(other._id, [{ participantId: 'p1', status: 'present' }], 'u1'),
      'CONFLICT'
    );
  });
});

describe('agenda', () => {
  it('adds at a position, updates, reorders and removes items', async () => {
    const meeting = await schedule();
    const { agendaItem: a } = await addAgendaItem(meeting._id, { title: 'A' }, 'u1');
    const { agendaItem: b } = await addAgendaItem(meeting._id, { title: 'B', position: 0 }, 'u1');
    expect((await getMeeting(meeting._id, 'u1')).agenda.map(i => i.title)).toEqual(['B', 'A']);

    const updated = await updateAgendaItem(
      meeting._id,
      a._id,
      { title: 'A2', durationMinutes: 15, presenterId: 'p1', description: 'd' },
      'u1'
    );
    expect(updated.agenda[1]).toMatchObject({ title: 'A2', durationMinutes: 15, presenterId: 'p1' });
    const cleared = await updateAgendaItem(
      meeting._id,
      a._id,
      { durationMinutes: null, presenterId: null, description: null },
      'u1'
    );
    expect(cleared.agenda[1].durationMinutes).toBeUndefined();
    expect(cleared.agenda[1].presenterId).toBeUndefined();

    const reordered = await reorderAgenda(meeting._id, [a._id, b._id], 'u1');
    expect(reordered.agenda.map(i => i.title)).toEqual(['A2', 'B']);

    const removed = await removeAgendaItem(meeting._id, a._id, 'u1');
    expect(removed.agenda.map(i => i.title)).toEqual(['B']);
    await rejectsWith(removeAgendaItem(meeting._id, a._id, 'u1'), 'NOT_FOUND');
    await rejectsWith(updateAgendaItem(meeting._id, 'nope', { title: 'x' }, 'u1'), 'NOT_FOUND');
  });

  it('rejects bad positions, durations and incomplete orderings', async () => {
    const meeting = await schedule();
    const { agendaItem: a } = await addAgendaItem(meeting._id, { title: 'A' }, 'u1');
    await rejectsWith(addAgendaItem(meeting._id, { title: 'B', position: 5 }, 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(addAgendaItem(meeting._id, { title: 'B', position: -1 }, 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(
      addAgendaItem(meeting._id, { title: 'B', durationMinutes: 0 }, 'u1'),
      'BAD_USER_INPUT'
    );
    await rejectsWith(addAgendaItem(meeting._id, { title: '' }, 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(reorderAgenda(meeting._id, [], 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(reorderAgenda(meeting._id, [a._id, a._id], 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(reorderAgenda(meeting._id, ['nope'], 'u1'), 'BAD_USER_INPUT');
  });

  it('detaches action items from a removed agenda item', async () => {
    const meeting = await schedule();
    const { agendaItem } = await addAgendaItem(meeting._id, { title: 'A' }, 'u1');
    const item = await createActionItem(
      { meetingId: meeting._id, title: 'Do', agendaItemId: agendaItem._id },
      'u1'
    );
    expect(item.agendaItemId).toBe(agendaItem._id);
    await removeAgendaItem(meeting._id, agendaItem._id, 'u1');
    expect((await getActionItem(item._id, 'u1')).agendaItemId).toBeUndefined();
  });

  it('can be edited on a completed meeting', async () => {
    const meeting = await started();
    await completeMeeting(meeting._id, 'u1');
    await expect(addAgendaItem(meeting._id, { title: 'late' }, 'u1')).resolves.toBeDefined();
  });
});

describe('minutes', () => {
  it('sets, replaces and clears minutes, logging whether they were cleared', async () => {
    const meeting = await schedule();
    const set = await setMinutes(meeting._id, '  Discussed roof  ', 'u2');
    expect(set.minutes).toMatchObject({ text: 'Discussed roof', updatedBy: 'u2' });
    const cleared = await setMinutes(meeting._id, '   ', 'u1');
    expect(cleared.minutes).toBeUndefined();
    const entries = (await MeetingsActivities.find({ action: 'minutes-updated' }).fetchAsync()) as any[];
    expect(entries.map(e => e.details.cleared).sort()).toEqual([false, true]);
    expect(JSON.stringify(entries)).not.toContain('Discussed roof');
  });

  it('rejects non-string and over-long minutes', async () => {
    const meeting = await schedule();
    await rejectsWith(setMinutes(meeting._id, 5 as any, 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(setMinutes(meeting._id, 'x'.repeat(500_001), 'u1'), 'BAD_USER_INPUT');
  });

  it('can be written after the meeting is completed', async () => {
    const meeting = await started();
    await completeMeeting(meeting._id, 'u1');
    await expect(setMinutes(meeting._id, 'notes', 'u1')).resolves.toBeDefined();
  });
});

describe('action items', () => {
  it('keeps the meeting open count in step with item status', async () => {
    const meeting = await schedule();
    const open = async () => (await getMeeting(meeting._id, 'u1')).openActionItemCount;
    const item = await createActionItem(
      { meetingId: meeting._id, title: 'A', assigneeId: 'p1', dueDate: future },
      'u1'
    );
    expect(item.status).toBe('open');
    expect(await open()).toBe(1);

    await setActionItemStatus(item._id, 'in-progress', 'u1');
    expect(await open()).toBe(1);
    const done = await setActionItemStatus(item._id, 'done', 'u2');
    expect(done).toMatchObject({ status: 'done', completedBy: 'u2' });
    expect(await open()).toBe(0);
    const reopened = await setActionItemStatus(item._id, 'open', 'u1');
    expect(reopened.completedAt).toBeUndefined();
    expect(await open()).toBe(1);
    await setActionItemStatus(item._id, 'cancelled', 'u1');
    expect(await open()).toBe(0);
    await deleteActionItem(item._id, 'u1');
    expect(await open()).toBe(0);
  });

  it('deleting an open item reduces the count', async () => {
    const meeting = await schedule();
    const item = await createActionItem({ meetingId: meeting._id, title: 'A' }, 'u1');
    await deleteActionItem(item._id, 'u1');
    expect((await getMeeting(meeting._id, 'u1')).openActionItemCount).toBe(0);
    expect(await actions(meeting._id)).toContain('action-item-deleted');
    await rejectsWith(getActionItem(item._id, 'u1'), 'NOT_FOUND');
  });

  it('is a no-op to set the same status, and rejects unknown statuses', async () => {
    const meeting = await schedule();
    const item = await createActionItem({ meetingId: meeting._id, title: 'A' }, 'u1');
    await setActionItemStatus(item._id, 'open', 'u1');
    expect(await actions(meeting._id)).not.toContain('action-item-status-changed');
    await rejectsWith(setActionItemStatus(item._id, 'x' as any, 'u1'), 'BAD_USER_INPUT');
  });

  it('updates and clears fields; agenda links must exist', async () => {
    const meeting = await schedule();
    const item = await createActionItem(
      { meetingId: meeting._id, title: 'A', assigneeId: 'p1', description: 'd' },
      'u1'
    );
    const updated = await updateActionItem(
      item._id,
      { title: 'A2', assigneeId: null, description: null, dueDate: future },
      'u1'
    );
    expect(updated).toMatchObject({ title: 'A2', updatedBy: 'u1' });
    expect(updated.assigneeId).toBeUndefined();
    expect(updated.description).toBeUndefined();
    await rejectsWith(updateActionItem(item._id, { agendaItemId: 'nope' }, 'u1'), 'NOT_FOUND');
    await rejectsWith(updateActionItem(item._id, { title: ' ' }, 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(
      createActionItem({ meetingId: meeting._id, title: 'B', agendaItemId: 'nope' }, 'u1'),
      'NOT_FOUND'
    );
  });

  it('cannot be changed once the meeting is cancelled, and reads become not found after the meeting is deleted', async () => {
    const meeting = await schedule();
    const item = await createActionItem({ meetingId: meeting._id, title: 'A' }, 'u1');
    await cancelMeeting(meeting._id, 'u1');
    await rejectsWith(updateActionItem(item._id, { title: 'B' }, 'u1'), 'CONFLICT');
    await rejectsWith(setActionItemStatus(item._id, 'done', 'u1'), 'CONFLICT');
    await rejectsWith(deleteActionItem(item._id, 'u1'), 'CONFLICT');
    await Meetings.removeAsync(meeting._id);
    await rejectsWith(getActionItem(item._id, 'u1'), 'NOT_FOUND');
  });

  it('can still be worked on after the meeting is completed', async () => {
    const meeting = await started();
    const item = await createActionItem({ meetingId: meeting._id, title: 'A' }, 'u1');
    await completeMeeting(meeting._id, 'u1');
    await expect(setActionItemStatus(item._id, 'done', 'u1')).resolves.toBeDefined();
  });

  it('lists by meeting, assignee, status and due date', async () => {
    const m1 = await schedule();
    const m2 = await schedule();
    const a = await createActionItem(
      { meetingId: m1._id, title: 'A', assigneeId: 'p1', dueDate: new Date(Date.now() + HOUR) },
      'u1'
    );
    const b = await createActionItem({ meetingId: m2._id, title: 'B', assigneeId: 'p2' }, 'u1');
    await setActionItemStatus(b._id, 'done', 'u1');
    const ids = async (o: any) => (await listActionItems(workspaceId, 'u1', o)).data.map(i => i._id);
    expect(await ids({ meetingId: m1._id })).toEqual([a._id]);
    expect(await ids({ assigneeId: 'p2' })).toEqual([b._id]);
    expect(await ids({ status: ['open', 'in-progress'] })).toEqual([a._id]);
    expect(await ids({ dueBefore: new Date(Date.now() + 2 * HOUR) })).toEqual([a._id]);
    expect(await ids({ meetingIds: [m2._id], meetingId: m1._id })).toEqual([]);
    await rejectsWith(listActionItems(workspaceId, 'u1', { status: 'x' as any }), 'BAD_USER_INPUT');
  });
});
