import { beforeEach, describe, expect, it } from 'vitest';

import {
  PollBallots,
  Polls,
  PollsActivities,
} from 'meteor/idreesia-common/server/collections/polls';

import {
  cancelPoll,
  castVote,
  closePoll,
  createPoll,
  createPollsWorkspace,
  deletePoll,
  getPoll,
  getVote,
  listBallots,
  listPolls,
  listVoterPolls,
  openPoll,
  reopenPoll,
  setPollQuestions,
  updatePoll,
  withdrawVote,
} from './index';

const DAY = 24 * 60 * 60 * 1000;
const inDays = (n: number) => new Date(Date.now() + n * DAY);

let workspaceId: string;

beforeEach(async () => {
  workspaceId = (await createPollsWorkspace({ name: 'W' }, 'u1'))._id;
});

const rejectsWith = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject({ extensions: { code } });
};

const questions = [
  { text: 'Where?', options: [{ text: 'Hall' }, { text: 'Garden' }] },
  {
    text: 'Food?',
    type: 'multiple' as const,
    required: false,
    minChoices: 1,
    maxChoices: 2,
    options: [{ text: 'Rice' }, { text: 'Bread' }, { text: 'Soup' }],
  },
];

const draft = (extra: Record<string, unknown> = {}) =>
  createPoll({ workspaceId, title: 'Venue', closesAt: inDays(1), questions, ...extra } as any, 'u1');

const open = async (extra: Record<string, unknown> = {}) => {
  const poll = await draft(extra);
  await openPoll(poll._id, 'u1');
  return getPoll(poll._id, 'u1');
};

const actions = async (pollId: string) =>
  (await PollsActivities.find({ pollId }, { sort: { at: 1 } }).fetchAsync()).map(
    (a: any) => a.action
  );

/** Moves an open poll's end time into the past, as if time had passed. */
const expire = (pollId: string) =>
  Polls.updateAsync(pollId, { $set: { closesAt: new Date(Date.now() - 1000) } });

const answerFirst = (poll: any) => [
  { questionId: poll.questions[0]._id, optionIds: [poll.questions[0].options[0]._id] },
];

describe('poll state transitions', () => {
  it('creates a draft with no votes and logs creation', async () => {
    const poll = await draft();
    expect(poll).toMatchObject({ status: 'draft', voteCount: 0, anonymous: false, createdBy: 'u1' });
    expect(await actions(poll._id)).toEqual(['poll-created']);
  });

  it('rejects an empty title, a bad end time, and bad question definitions at creation', async () => {
    await rejectsWith(draft({ title: ' ' }), 'BAD_USER_INPUT');
    await rejectsWith(draft({ closesAt: 'soon' }), 'BAD_USER_INPUT');
    await rejectsWith(draft({ anonymous: 'yes' }), 'BAD_USER_INPUT');
    await rejectsWith(draft({ questions: 'nope' }), 'BAD_USER_INPUT');
    await rejectsWith(createPoll({ workspaceId: 'nope', title: 'x', closesAt: inDays(1) }, 'u1'), 'NOT_FOUND');
  });

  it('opens a draft, recording who and when', async () => {
    const poll = await draft();
    const opened = await openPoll(poll._id, 'u2');
    expect(opened).toMatchObject({ status: 'open', openedBy: 'u2' });
    expect(opened.openedAt).toBeInstanceOf(Date);
    await rejectsWith(openPoll(poll._id, 'u1'), 'CONFLICT');
  });

  it('refuses to open without questions or with too few options, or with a past end time', async () => {
    const empty = await draft({ questions: [] });
    await rejectsWith(openPoll(empty._id, 'u1'), 'CONFLICT');
    const thin = await draft({ questions: [{ text: 'Q', options: [{ text: 'Only' }] }] });
    await rejectsWith(openPoll(thin._id, 'u1'), 'CONFLICT');
    const ok = await draft();
    await rejectsWith(openPoll(ok._id, 'u1', { closesAt: new Date(Date.now() - 1000) }), 'BAD_USER_INPUT');
    const later = await openPoll(ok._id, 'u1', { closesAt: inDays(5) });
    expect(later.closesAt.getTime()).toBeGreaterThan(inDays(4).getTime());
  });

  it('closes only an open poll', async () => {
    const poll = await draft();
    await rejectsWith(closePoll(poll._id, 'u1'), 'CONFLICT');
    await openPoll(poll._id, 'u1');
    const closed = await closePoll(poll._id, 'u2');
    expect(closed).toMatchObject({ status: 'closed', closedBy: 'u2' });
    await rejectsWith(closePoll(poll._id, 'u1'), 'CONFLICT');
  });

  it('settles a poll whose end time has passed as closed on the next read', async () => {
    const poll = await open();
    await expire(poll._id);
    const settled = await getPoll(poll._id, 'u1');
    expect(settled.status).toBe('closed');
    expect(settled.closedAt?.getTime()).toBe(settled.closesAt.getTime());
    await rejectsWith(closePoll(poll._id, 'u1'), 'CONFLICT');
  });

  it('reopens a closed poll with a future end time, clearing closure', async () => {
    const poll = await open();
    await closePoll(poll._id, 'u1');
    await rejectsWith(reopenPoll(poll._id, { closesAt: new Date(Date.now() - 1000) }, 'u1'), 'BAD_USER_INPUT');
    const reopened = await reopenPoll(poll._id, { closesAt: inDays(3) }, 'u1');
    expect(reopened.status).toBe('open');
    expect(reopened.closedAt).toBeUndefined();
    expect(reopened.closedBy).toBeUndefined();
    await rejectsWith(reopenPoll(poll._id, { closesAt: inDays(3) }, 'u1'), 'CONFLICT');
    const d = await draft();
    await rejectsWith(reopenPoll(d._id, { closesAt: inDays(3) }, 'u1'), 'CONFLICT');
  });

  it('cancels draft and open polls with a reason, but not closed or cancelled ones', async () => {
    const d = await draft();
    const cancelled = await cancelPoll(d._id, 'u2', { reason: ' wrong date ' });
    expect(cancelled).toMatchObject({
      status: 'cancelled',
      cancelledBy: 'u2',
      cancellationReason: 'wrong date',
    });
    await rejectsWith(cancelPoll(d._id, 'u1'), 'CONFLICT');
    await rejectsWith(openPoll(d._id, 'u1'), 'CONFLICT');

    const o = await open();
    await expect(cancelPoll(o._id, 'u1')).resolves.toBeDefined();

    const c = await open();
    await closePoll(c._id, 'u1');
    await rejectsWith(cancelPoll(c._id, 'u1'), 'CONFLICT');
  });

  it('logs each transition in order', async () => {
    const poll = await open();
    await closePoll(poll._id, 'u1');
    await reopenPoll(poll._id, { closesAt: inDays(2) }, 'u1');
    await cancelPoll(poll._id, 'u1');
    expect(await actions(poll._id)).toEqual([
      'poll-created',
      'poll-opened',
      'poll-closed',
      'poll-reopened',
      'poll-cancelled',
    ]);
  });

  it('deletes a poll with its ballots, keeping the activity', async () => {
    const poll = await open();
    await castVote(poll._id, 'p1', answerFirst(poll), 'u1');
    await deletePoll(poll._id, 'u1');
    expect(await Polls.find({}).countAsync()).toBe(0);
    expect(await PollBallots.find({}).countAsync()).toBe(0);
    expect(await actions(poll._id)).toContain('poll-deleted');
    await rejectsWith(getPoll(poll._id, 'u1'), 'NOT_FOUND');
  });

  it('requires a user id', async () => {
    const poll = await draft();
    await rejectsWith(openPoll(poll._id, ''), 'BAD_USER_INPUT');
  });
});

describe('updatePoll', () => {
  it('edits details of draft and open polls; closed ones are read-only', async () => {
    const poll = await open();
    const updated = await updatePoll(poll._id, { title: 'New', description: 'd', tags: ['a'] }, 'u1');
    expect(updated).toMatchObject({ title: 'New', description: 'd', tags: ['a'] });
    expect((await updatePoll(poll._id, { description: null }, 'u1')).description).toBeUndefined();
    await closePoll(poll._id, 'u1');
    await rejectsWith(updatePoll(poll._id, { title: 'x' }, 'u1'), 'CONFLICT');
  });

  it('only lets the anonymity change while a draft', async () => {
    const poll = await draft();
    expect((await updatePoll(poll._id, { anonymous: true }, 'u1')).anonymous).toBe(true);
    await openPoll(poll._id, 'u1');
    await rejectsWith(updatePoll(poll._id, { anonymous: false }, 'u1'), 'CONFLICT');
    await expect(updatePoll(poll._id, { anonymous: true }, 'u1')).resolves.toBeDefined();
  });

  it('requires a future end time on an open poll', async () => {
    const poll = await open();
    await rejectsWith(updatePoll(poll._id, { closesAt: new Date(Date.now() - 1000) }, 'u1'), 'BAD_USER_INPUT');
    await expect(updatePoll(poll._id, { closesAt: inDays(4) }, 'u1')).resolves.toBeDefined();
  });
});

describe('questions', () => {
  it('can only change while the poll is a draft, and keeps ids of questions and options passed back', async () => {
    const poll = await draft();
    const [q1] = poll.questions;
    const updated = await setPollQuestions(
      poll._id,
      [
        { _id: q1._id, text: 'Where now?', options: [{ _id: q1.options[0]._id, text: 'Hall 2' }, { text: 'Lawn' }] },
      ],
      'u1'
    );
    expect(updated.questions).toHaveLength(1);
    expect(updated.questions[0]._id).toBe(q1._id);
    expect(updated.questions[0].options[0]._id).toBe(q1.options[0]._id);
    expect(updated.questions[0].options[1]._id).not.toBe(q1.options[1]._id);
    expect(await actions(poll._id)).toContain('questions-updated');

    await openPoll(poll._id, 'u1');
    await rejectsWith(
      setPollQuestions(poll._id, [{ text: 'Q', options: [{ text: 'a' }, { text: 'b' }] }], 'u1'),
      'CONFLICT'
    );
  });

  it('unknown ids get fresh ones, and an id cannot be reused twice', async () => {
    const poll = await draft();
    const [q1] = poll.questions;
    const updated = await setPollQuestions(
      poll._id,
      [
        { _id: q1._id, text: 'A', options: [{ text: 'x' }, { text: 'y' }] },
        { _id: q1._id, text: 'B', options: [{ text: 'x' }, { text: 'y' }] },
        { _id: 'made-up', text: 'C', options: [{ text: 'x' }, { text: 'y' }] },
      ],
      'u1'
    );
    const ids = updated.questions.map(q => q._id);
    expect(new Set(ids).size).toBe(3);
    expect(ids).not.toContain('made-up');
  });

  it.each([
    ['empty question text', [{ text: ' ', options: [{ text: 'a' }, { text: 'b' }] }]],
    ['unknown type', [{ text: 'Q', type: 'ranked', options: [{ text: 'a' }, { text: 'b' }] }]],
    ['non-boolean required', [{ text: 'Q', required: 'yes', options: [{ text: 'a' }] }]],
    ['duplicate option (case-insensitive)', [{ text: 'Q', options: [{ text: 'a' }, { text: 'A' }] }]],
    ['options not a list', [{ text: 'Q', options: 'a' }]],
    ['empty option', [{ text: 'Q', options: [{ text: '' }, { text: 'b' }] }]],
    [
      'maxChoices above option count',
      [{ text: 'Q', type: 'multiple', maxChoices: 5, options: [{ text: 'a' }, { text: 'b' }] }],
    ],
    [
      'minChoices above maxChoices',
      [{ text: 'Q', type: 'multiple', minChoices: 3, maxChoices: 2, options: [{ text: 'a' }, { text: 'b' }, { text: 'c' }] }],
    ],
    [
      'zero minChoices',
      [{ text: 'Q', type: 'multiple', minChoices: 0, options: [{ text: 'a' }, { text: 'b' }] }],
    ],
  ] as const)('rejects %s', async (_name, input) => {
    const poll = await draft();
    await rejectsWith(setPollQuestions(poll._id, input as any, 'u1'), 'BAD_USER_INPUT');
    expect((await getPoll(poll._id, 'u1')).questions).toHaveLength(2);
  });

  it('rejects too many questions or options', async () => {
    const poll = await draft();
    const many = Array.from({ length: 51 }, (_, i) => ({
      text: `Q${i}`,
      options: [{ text: 'a' }, { text: 'b' }],
    }));
    await rejectsWith(setPollQuestions(poll._id, many, 'u1'), 'BAD_USER_INPUT');
    const options = Array.from({ length: 51 }, (_, i) => ({ text: `o${i}` }));
    await rejectsWith(setPollQuestions(poll._id, [{ text: 'Q', options }], 'u1'), 'BAD_USER_INPUT');
  });
});

describe('voting', () => {
  it('casts, changes (without double counting) and withdraws a vote', async () => {
    const poll = await open();
    const [q1, q2] = poll.questions;
    const first = await castVote(poll._id, 'p1', answerFirst(poll), 'u1');
    expect(first.isNew).toBe(true);
    expect((await getPoll(poll._id, 'u1')).voteCount).toBe(1);

    const changed = await castVote(
      poll._id,
      'p1',
      [
        { questionId: q1._id, optionIds: [q1.options[1]._id] },
        { questionId: q2._id, optionIds: [q2.options[0]._id, q2.options[2]._id] },
      ],
      'u1'
    );
    expect(changed.isNew).toBe(false);
    expect(changed.ballot.answers).toHaveLength(2);
    expect((await getPoll(poll._id, 'u1')).voteCount).toBe(1);
    expect(await PollBallots.find({}).countAsync()).toBe(1);
    expect(await actions(poll._id)).toEqual([
      'poll-created',
      'poll-opened',
      'vote-cast',
      'vote-changed',
    ]);

    await withdrawVote(poll._id, 'p1', 'u1');
    expect((await getPoll(poll._id, 'u1')).voteCount).toBe(0);
    expect(await getVote(poll._id, 'p1', 'u1')).toBeNull();
    await rejectsWith(withdrawVote(poll._id, 'p1', 'u1'), 'NOT_FOUND');
  });

  it('counts each voter once', async () => {
    const poll = await open();
    await castVote(poll._id, 'p1', answerFirst(poll), 'u1');
    await castVote(poll._id, 'p2', answerFirst(poll), 'u2');
    expect((await getPoll(poll._id, 'u1')).voteCount).toBe(2);
    expect((await getVote(poll._id, 'p2', 'u1'))?.voterId).toBe('p2');
  });

  it('does not accept votes on a draft, a closed or cancelled poll, or after the end time', async () => {
    const d = await draft();
    await rejectsWith(castVote(d._id, 'p1', answerFirst(d), 'u1'), 'CONFLICT');

    const poll = await open();
    const answers = answerFirst(poll);
    await closePoll(poll._id, 'u1');
    await rejectsWith(castVote(poll._id, 'p1', answers, 'u1'), 'CONFLICT');

    const expiring = await open();
    await expire(expiring._id);
    await rejectsWith(castVote(expiring._id, 'p1', answerFirst(expiring), 'u1'), 'CONFLICT');

    const cancelled = await open();
    const a = answerFirst(cancelled);
    await cancelPoll(cancelled._id, 'u1');
    await rejectsWith(castVote(cancelled._id, 'p1', a, 'u1'), 'CONFLICT');
  });

  it('does not allow withdrawing once voting has ended', async () => {
    const poll = await open();
    await castVote(poll._id, 'p1', answerFirst(poll), 'u1');
    await closePoll(poll._id, 'u1');
    await rejectsWith(withdrawVote(poll._id, 'p1', 'u1'), 'CONFLICT');
    expect(await PollBallots.find({}).countAsync()).toBe(1);
  });

  describe('answer validation', () => {
    it('requires required questions and at least one answer', async () => {
      const poll = await open();
      const [, q2] = poll.questions;
      await rejectsWith(castVote(poll._id, 'p1', [], 'u1'), 'BAD_USER_INPUT');
      await rejectsWith(
        castVote(poll._id, 'p1', [{ questionId: q2._id, optionIds: [q2.options[0]._id] }], 'u1'),
        'BAD_USER_INPUT'
      );
      await rejectsWith(castVote(poll._id, 'p1', 'x' as any, 'u1'), 'BAD_USER_INPUT');
    });

    it('rejects unknown, duplicated and malformed answers', async () => {
      const poll = await open();
      const [q1] = poll.questions;
      const good = { questionId: q1._id, optionIds: [q1.options[0]._id] };
      await rejectsWith(castVote(poll._id, 'p1', [good, good], 'u1'), 'BAD_USER_INPUT');
      await rejectsWith(castVote(poll._id, 'p1', [good, { questionId: 'nope', optionIds: [] }], 'u1'), 'BAD_USER_INPUT');
      await rejectsWith(castVote(poll._id, 'p1', [{ questionId: '', optionIds: [] }], 'u1'), 'BAD_USER_INPUT');
      await rejectsWith(castVote(poll._id, 'p1', [{ questionId: q1._id, optionIds: [5 as any] }], 'u1'), 'BAD_USER_INPUT');
      await rejectsWith(castVote(poll._id, 'p1', [{ questionId: q1._id, optionIds: ['nope'] }], 'u1'), 'BAD_USER_INPUT');
    });

    it('single-choice questions take exactly one option', async () => {
      const poll = await open();
      const [q1] = poll.questions;
      await rejectsWith(
        castVote(poll._id, 'p1', [{ questionId: q1._id, optionIds: q1.options.map(o => o._id) }], 'u1'),
        'BAD_USER_INPUT'
      );
    });

    it('multiple-choice questions honour min/max and reject repeated options', async () => {
      const poll = await open();
      const [q1, q2] = poll.questions;
      const base = { questionId: q1._id, optionIds: [q1.options[0]._id] };
      await rejectsWith(
        castVote(poll._id, 'p1', [base, { questionId: q2._id, optionIds: q2.options.map(o => o._id) }], 'u1'),
        'BAD_USER_INPUT'
      );
      await rejectsWith(
        castVote(poll._id, 'p1', [base, { questionId: q2._id, optionIds: [q2.options[0]._id, q2.options[0]._id] }], 'u1'),
        'BAD_USER_INPUT'
      );
      await expect(
        castVote(poll._id, 'p1', [base, { questionId: q2._id, optionIds: [q2.options[1]._id] }], 'u1')
      ).resolves.toBeDefined();
    });

    it('a failed vote leaves no ballot and no count', async () => {
      const poll = await open();
      await expect(castVote(poll._id, 'p1', [], 'u1')).rejects.toBeDefined();
      expect(await PollBallots.find({}).countAsync()).toBe(0);
      expect((await getPoll(poll._id, 'u1')).voteCount).toBe(0);
    });
  });

  describe('anonymous polls', () => {
    it('logs no vote activity and refuses to list ballots', async () => {
      const poll = await open({ anonymous: true });
      await castVote(poll._id, 'p1', answerFirst(poll), 'u1');
      await castVote(poll._id, 'p1', answerFirst(poll), 'u1');
      await withdrawVote(poll._id, 'p1', 'u1');
      expect(await actions(poll._id)).toEqual(['poll-created', 'poll-opened']);
      await rejectsWith(listBallots(poll._id, 'u1'), 'FORBIDDEN');
    });
  });

  it('lists ballots of a named poll in order with a total, and pages them', async () => {
    const poll = await open();
    await castVote(poll._id, 'p1', answerFirst(poll), 'u1');
    await new Promise<void>(resolve => {
      setTimeout(resolve, 5);
    });
    await castVote(poll._id, 'p2', answerFirst(poll), 'u2');
    const all = await listBallots(poll._id, 'u1');
    expect(all.data.map(b => b.voterId)).toEqual(['p1', 'p2']);
    const page = await listBallots(poll._id, 'u1', { skip: 1, limit: 1 });
    expect(page.data.map(b => b.voterId)).toEqual(['p2']);
    expect(page.totalResults).toBe(2);
  });

  it('getVote and listBallots need an existing poll and a user', async () => {
    await rejectsWith(getVote('nope', 'p1', 'u1'), 'NOT_FOUND');
    await rejectsWith(listBallots('nope', 'u1'), 'NOT_FOUND');
    const poll = await open();
    await rejectsWith(getVote(poll._id, '', 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(getVote(poll._id, 'p1', ''), 'BAD_USER_INPUT');
  });
});

describe('listing polls', () => {
  it('filters by status, tags and closing window, and settles expired polls first', async () => {
    const a = await draft({ title: 'A', tags: ['x'] });
    const b = await open({ title: 'B' });
    const c = await open({ title: 'C' });
    await expire(c._id);
    const ids = async (o: any) => (await listPolls(workspaceId, 'u1', o)).data.map(p => p._id);
    expect(await ids({ status: 'draft' })).toEqual([a._id]);
    expect(await ids({ status: ['open'] })).toEqual([b._id]);
    expect(await ids({ status: 'closed' })).toEqual([c._id]);
    expect(await ids({ tags: ['x'] })).toEqual([a._id]);
    expect(await ids({ closesAfter: new Date() })).toHaveLength(2);
    expect((await ids({ sortOrder: 'desc', sortBy: 'createdAt' }))[0]).toBe(c._id);
    await rejectsWith(listPolls(workspaceId, 'u1', { status: 'x' as any }), 'BAD_USER_INPUT');
    await rejectsWith(listPolls(workspaceId, 'u1', { metadata: { 'a b': 1 } }), 'BAD_USER_INPUT');
  });

  it("lists a voter's polls: open and closed by default, split by voted, never drafts", async () => {
    await draft({ title: 'draft' });
    const voted = await open({ title: 'voted' });
    const notVoted = await open({ title: 'not voted' });
    await castVote(voted._id, 'p1', answerFirst(voted), 'u1');
    const ids = async (o: any = {}) => (await listVoterPolls('p1', 'u1', o)).data.map(p => p._id).sort();
    expect(await ids()).toEqual([voted._id, notVoted._id].sort());
    expect(await ids({ voted: true })).toEqual([voted._id]);
    expect(await ids({ voted: false })).toEqual([notVoted._id]);
    expect(await ids({ workspaceIds: ['nope'] })).toEqual([]);
  });
});
