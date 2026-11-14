import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Users } from 'meteor/idreesia-common/server/collections/admin';
import Notifications from 'meteor/idreesia-common/server/collections/common/notifications';
import Committees from 'meteor/idreesia-common/server/collections/hr/committees';
import { markNotificationsRead } from 'meteor/idreesia-common/server/headless';

import {
  buildCancelledNotification,
  buildInvitedNotification,
  buildRescheduledNotification,
} from './notifications';
import {
  addParticipants,
  cancelMeeting,
  createMeeting,
  createMeetingsWorkspace,
  removeParticipant,
  updateMeeting,
} from './index';

const HOUR = 60 * 60 * 1000;
const start = new Date(Date.now() + 24 * HOUR);
const end = new Date(start.getTime() + HOUR);

const hourLater = (n = 1) => ({
  startsAt: new Date(start.getTime() + n * HOUR),
  endsAt: new Date(end.getTime() + n * HOUR),
});

const meetingNotifications = async () =>
  (await Notifications.find({ module: 'meetings' }).fetchAsync()) as any[];

let workspaceId: string;

const newMeeting = async (participantIds: string[] = ['p1', 'p2', 'p3']) =>
  createMeeting(
    {
      workspaceId,
      title: 'Board meeting',
      startsAt: start,
      endsAt: end,
      participants: participantIds.map(participantId => ({ participantId })),
    },
    'u1'
  );

beforeEach(async () => {
  // u1 organises; u2 and u3 are invited; p3 has no ERP user.
  await Users.insertAsync({ _id: 'u1', personId: 'p1' } as any);
  await Users.insertAsync({ _id: 'u2', personId: 'p2' } as any);
  workspaceId = (await createMeetingsWorkspace({ name: 'W' }, 'u1'))._id;
  // Notifications belong to the committee that owns the workspace.
  await Committees.insertAsync({
    _id: 'c1',
    name: 'Committee',
    members: [],
    meetingsWorkspaceId: workspaceId,
  } as any);
});

describe('meeting notifications', () => {
  it('invites participants when a meeting is scheduled, except the organiser and people without a user', async () => {
    const meeting = await newMeeting();

    const all = await meetingNotifications();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({
      recipientUserId: 'u2',
      actorUserId: 'u1',
      entityType: 'meeting',
      entityId: meeting._id,
      eventType: 'meeting-invited',
    });
  });

  it('invites participants added later, and not the existing ones again', async () => {
    const meeting = await newMeeting(['p1']);
    expect(await meetingNotifications()).toHaveLength(0);

    await addParticipants(meeting._id, [{ participantId: 'p2' }], 'u1');

    const all = await meetingNotifications();
    expect(all).toHaveLength(1);
    expect(all[0].recipientUserId).toBe('u2');
  });

  it('tells participants when the time changes, but not for other edits', async () => {
    const meeting = await newMeeting();
    await updateMeeting(meeting._id, { title: 'Renamed' }, 'u1');
    expect(
      (await meetingNotifications()).filter(n => n.eventType === 'meeting-rescheduled')
    ).toHaveLength(0);

    await updateMeeting(
      meeting._id,
      { startsAt: new Date(start.getTime() + HOUR), endsAt: new Date(end.getTime() + HOUR) },
      'u1'
    );

    const rescheduled = (await meetingNotifications()).filter(
      n => n.eventType === 'meeting-rescheduled'
    );
    expect(rescheduled).toHaveLength(1);
    expect(rescheduled[0].recipientUserId).toBe('u2');
  });

  it('tells participants when a meeting is cancelled', async () => {
    const meeting = await newMeeting();

    await cancelMeeting(meeting._id, 'u1', { reason: 'No quorum' });

    const cancelled = (await meetingNotifications()).filter(
      n => n.eventType === 'meeting-cancelled'
    );
    expect(cancelled).toHaveLength(1);
    expect(cancelled[0]).toMatchObject({ recipientUserId: 'u2', actorUserId: 'u1' });
  });
});

describe('more cases', () => {
  it('sends nothing for a meeting with no participants', async () => {
    await newMeeting([]);
    expect(await meetingNotifications()).toHaveLength(0);
  });

  it('sends nothing when an update sets the same times', async () => {
    const meeting = await newMeeting();
    await updateMeeting(meeting._id, { startsAt: start, endsAt: end }, 'u1');
    expect(
      (await meetingNotifications()).filter(n => n.eventType === 'meeting-rescheduled')
    ).toHaveLength(0);
  });

  it('keeps one notification for repeated reschedules, unread again each time', async () => {
    const meeting = await newMeeting();
    await updateMeeting(meeting._id, hourLater(1), 'u1');
    await markNotificationsRead(
      'u2',
      [{ committeeId: 'c1', module: 'meetings' }],
      [`meetings:rescheduled:${meeting._id}:u2`]
    );
    const first = (await Notifications.findOneAsync(
      `meetings:rescheduled:${meeting._id}:u2`
    )) as any;
    expect(first.readBy).toContain('u2');

    await updateMeeting(meeting._id, hourLater(2), 'u1');

    const rescheduled = (await meetingNotifications()).filter(
      n => n.eventType === 'meeting-rescheduled'
    );
    expect(rescheduled).toHaveLength(1);
    expect(rescheduled[0].readBy).not.toContain('u2');
  });

  it('does not notify the organiser of their own reschedule or cancellation', async () => {
    const meeting = await newMeeting(['p1', 'p2']);
    await updateMeeting(meeting._id, hourLater(), 'u1');
    await cancelMeeting(meeting._id, 'u1');
    const all = await meetingNotifications();
    expect(all.filter(n => n.recipientUserId === 'u1')).toHaveLength(0);
    expect(all.filter(n => n.recipientUserId === 'u2')).toHaveLength(3);
  });

  it('does not tell a removed participant about a cancellation', async () => {
    const meeting = await newMeeting(['p1', 'p2']);
    await removeParticipant(meeting._id, 'p2', 'u1');
    await cancelMeeting(meeting._id, 'u1');
    expect(
      (await meetingNotifications()).filter(n => n.eventType === 'meeting-cancelled')
    ).toHaveLength(0);
  });
});

describe('builders', () => {
  const meeting = {
    _id: 'm1',
    workspaceId: 'ws1',
    title: 'Board meeting',
    startsAt: new Date('2026-06-01T10:00:00Z'),
    endsAt: new Date('2026-06-01T11:00:00Z'),
    timeZone: 'Asia/Karachi',
  };
  const now = new Date('2026-05-30T00:00:00Z');

  it('builds the invitation', () => {
    expect(buildInvitedNotification(meeting, 'u2', 'u1', now)).toEqual({
      id: 'invited:m1:u2',
      workspaceId: 'ws1',
      entityType: 'meeting',
      entityId: 'm1',
      eventType: 'meeting-invited',
      eventDetails: 'You are invited to "Board meeting" on 1 Jun 2026, 15:00.',
      data: { startsAt: '2026-06-01T10:00:00.000Z', endsAt: '2026-06-01T11:00:00.000Z' },
      createdAt: now,
      recipientUserId: 'u2',
      actorUserId: 'u1',
    });
  });

  it('builds the reschedule and cancellation with their own ids and text', () => {
    const rescheduled = buildRescheduledNotification(meeting, 'u2', 'u1', now);
    expect(rescheduled).toMatchObject({
      id: 'rescheduled:m1:u2',
      eventType: 'meeting-rescheduled',
      eventDetails: '"Board meeting" was rescheduled to 1 Jun 2026, 15:00.',
    });
    const cancelled = buildCancelledNotification(meeting, 'u2', 'u1', now);
    expect(cancelled).toMatchObject({
      id: 'cancelled:m1:u2',
      eventType: 'meeting-cancelled',
      eventDetails: '"Board meeting" was cancelled.',
    });
  });

  it('falls back to an ISO time for an unknown time zone', () => {
    const n = buildInvitedNotification({ ...meeting, timeZone: 'Nowhere/Land' }, 'u2', 'u1', now);
    expect(n.eventDetails).toContain('2026-06-01T10:00:00.000Z');
  });
});

describe('publishing is best effort', () => {
  afterEach(() => vi.restoreAllMocks());

  it('logs a failed publish and still completes the operation', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(Notifications, 'insertAsync').mockRejectedValue(new Error('database down'));

    const meeting = await newMeeting();
    const cancelled = await cancelMeeting(meeting._id, 'u1');

    expect(cancelled.status).toBe('cancelled');
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(await meetingNotifications()).toHaveLength(0);
  });
});
