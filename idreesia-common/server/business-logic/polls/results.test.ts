import { beforeEach, describe, expect, it } from 'vitest';

import {
  canSeeResults,
  castVote,
  closePoll,
  createPoll,
  createPollsWorkspace,
  getPoll,
  getPollResults,
  openPoll,
} from './index';

const DAY = 24 * 60 * 60 * 1000;

let workspaceId: string;

beforeEach(async () => {
  workspaceId = (await createPollsWorkspace({ name: 'W' }, 'u1'))._id;
});

const newPoll = () =>
  createPoll(
    {
      workspaceId,
      title: 'Venue',
      closesAt: new Date(Date.now() + DAY),
      questions: [{ text: 'Where?', options: [{ text: 'Hall' }, { text: 'Garden' }] }],
    },
    'u1'
  );

describe('poll results visibility', () => {
  it('has no results for a draft, even for the caller who includes open polls', async () => {
    const poll = await newPoll();
    expect(canSeeResults(poll, { includeOpen: true })).toBe(false);
    await expect(
      getPollResults(poll._id, 'u1', { includeOpen: true })
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
  });

  it('hides results while voting is open, unless the caller includes open polls', async () => {
    const poll = await newPoll();
    await openPoll(poll._id, 'u1');
    const current = await getPoll(poll._id, 'u1');

    expect(canSeeResults(current)).toBe(false);
    expect(canSeeResults(current, { includeOpen: true })).toBe(true);
    await expect(getPollResults(poll._id, 'u1')).rejects.toMatchObject({
      extensions: { code: 'CONFLICT' },
    });

    const optionId = current.questions[0].options[0]._id;
    await castVote(
      poll._id,
      'p1',
      [{ questionId: current.questions[0]._id, optionIds: [optionId] }],
      'u1'
    );
    const results = await getPollResults(poll._id, 'u1', { includeOpen: true });
    expect(results.totalVoters).toBe(1);
  });

  it('shows results to everyone once the poll is closed', async () => {
    const poll = await newPoll();
    await openPoll(poll._id, 'u1');
    const closed = await closePoll(poll._id, 'u1');

    expect(canSeeResults(closed)).toBe(true);
    expect((await getPollResults(poll._id, 'u1')).status).toBe('closed');
  });
});
