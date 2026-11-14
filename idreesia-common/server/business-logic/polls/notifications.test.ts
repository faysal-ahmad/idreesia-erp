import { beforeEach, describe, expect, it } from 'vitest';

import Notifications from 'meteor/idreesia-common/server/collections/common/notifications';
import Committees from 'meteor/idreesia-common/server/collections/hr/committees';

import {
  cancelPoll,
  closePoll,
  createPoll,
  createPollsWorkspace,
  openPoll,
} from './index';

const DAY = 24 * 60 * 60 * 1000;

const pollNotifications = async () =>
  (await Notifications.find({ module: 'polls' }).fetchAsync()) as any[];

let workspaceId: string;

const newPoll = async () =>
  createPoll(
    {
      workspaceId,
      title: 'Venue',
      closesAt: new Date(Date.now() + DAY),
      questions: [
        {
          text: 'Where?',
          options: [{ text: 'Hall' }, { text: 'Garden' }],
        },
      ],
    },
    'u1'
  );

const newOpenPoll = async () => {
  const poll = await newPoll();
  await openPoll(poll._id, 'u1');
  return poll;
};

beforeEach(async () => {
  workspaceId = (await createPollsWorkspace({ name: 'W' }, 'u1'))._id;
  await Committees.insertAsync({
    _id: 'c1',
    name: 'Committee',
    members: [],
    pollsWorkspaceId: workspaceId,
  } as any);
});

describe('poll notifications', () => {
  it('tells the committee when an open poll is cancelled', async () => {
    const poll = await newOpenPoll();

    await cancelPoll(poll._id, 'u1', { reason: 'Rescheduled' });

    const all = await pollNotifications();
    expect(all).toHaveLength(1);
    expect(all[0].recipientUserId).toBeUndefined();
    expect(all[0]).toMatchObject({
      committeeId: 'c1',
      actorUserId: 'u1',
      entityType: 'poll',
      entityId: poll._id,
      eventType: 'poll-cancelled',
    });
  });

  it('sends nothing when a draft is cancelled', async () => {
    const poll = await newPoll();

    await cancelPoll(poll._id, 'u1');

    expect(await pollNotifications()).toHaveLength(0);
  });

  it('tells the committee when a poll is closed early', async () => {
    const poll = await newOpenPoll();

    await closePoll(poll._id, 'u1');

    const all = await pollNotifications();
    expect(all).toHaveLength(1);
    expect(all[0].recipientUserId).toBeUndefined();
    expect(all[0]).toMatchObject({
      committeeId: 'c1',
      actorUserId: 'u1',
      eventType: 'poll-closed',
    });
    expect(all[0].eventDetails).toContain('Results are available');
  });

  it('sends nothing when opening a poll', async () => {
    await newOpenPoll();
    expect(await pollNotifications()).toHaveLength(0);
  });

  it('still cancels the poll when no committee owns the workspace', async () => {
    const poll = await newOpenPoll();
    await Committees.removeAsync('c1');

    const cancelled = await cancelPoll(poll._id, 'u1');

    expect(cancelled.status).toBe('cancelled');
    expect(await pollNotifications()).toHaveLength(0);
  });
});
