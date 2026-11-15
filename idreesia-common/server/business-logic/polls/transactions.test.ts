import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PollBallots,
  Polls,
  PollsActivities,
} from 'meteor/idreesia-common/server/collections/polls';

import { castVote, createPoll, createPollsWorkspace, getPoll, openPoll } from './index';

// A vote and the poll's vote count are one transaction.

const DAY = 24 * 60 * 60 * 1000;

let workspaceId: string;

beforeEach(async () => {
  workspaceId = (await createPollsWorkspace({ name: 'W' }, 'u1'))._id;
});

afterEach(() => {
  vi.restoreAllMocks();
});

const newOpenPoll = async () => {
  const poll = await createPoll(
    {
      workspaceId,
      title: 'Venue',
      closesAt: new Date(Date.now() + DAY),
      questions: [{ text: 'Where?', options: [{ text: 'Hall' }, { text: 'Garden' }] }],
    },
    'u1'
  );
  await openPoll(poll._id, 'u1');
  return getPoll(poll._id, 'u1');
};

describe('polls transactions', () => {
  it('keeps no ballot and the vote count when a vote cannot be logged', async () => {
    const poll = await newOpenPoll();
    const [question] = poll.questions;
    vi.spyOn(PollsActivities, 'insertAsync').mockRejectedValueOnce(
      new Error('activity log failed')
    );

    await expect(
      castVote(
        poll._id,
        'p1',
        [{ questionId: question._id, optionIds: [question.options[0]._id] }],
        'u1'
      )
    ).rejects.toThrow('activity log failed');

    expect(await PollBallots.find({}).countAsync()).toBe(0);
    expect((await Polls.findOneAsync(poll._id))?.voteCount ?? 0).toBe(0);
  });
});
