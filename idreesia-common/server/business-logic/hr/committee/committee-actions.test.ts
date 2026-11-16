import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createMeeting,
  createMeetingsWorkspace,
  getMeeting,
  respondToInvitation,
} from 'meteor/idreesia-common/server/business-logic/meetings';
import {
  castVote,
  createPollsWorkspace,
  getPoll,
  openPoll,
} from 'meteor/idreesia-common/server/business-logic/polls';
import {
  createProjectsWorkspace,
  getProject,
  getTask,
} from 'meteor/idreesia-common/server/business-logic/projects';
import {
  Meetings,
  MeetingsActivities,
} from 'meteor/idreesia-common/server/collections/meetings';
import { Polls } from 'meteor/idreesia-common/server/collections/polls';
import {
  Projects,
  ProjectsActivities,
  ProjectTasks,
} from 'meteor/idreesia-common/server/collections/projects';

import {
  createCommitteeMeeting,
  parseTimestamp,
  setCommitteeMeetingParticipants,
  updateCommitteeMeeting,
} from './meetings-actions';
import { createCommitteePoll, updateCommitteePoll } from './polls-actions';
import {
  addCommitteeProjectParticipants,
  createCommitteeProject,
  createCommitteeTask,
  deleteCommitteeProject,
  removeCommitteeProjectParticipant,
  setCommitteeProjectStatus,
  updateCommitteeProject,
  updateCommitteeTask,
} from './projects-actions';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const ms = (offset: number) => String(Date.now() + offset);

afterEach(() => {
  vi.restoreAllMocks();
});

const rejectsWith = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject({ extensions: { code } });
};

describe('parseTimestamp', () => {
  it('reads milliseconds as a number or a numeric string', () => {
    expect(parseTimestamp(1000)?.getTime()).toBe(1000);
    expect(parseTimestamp('2000')?.getTime()).toBe(2000);
    expect(parseTimestamp('0')?.getTime()).toBe(0);
  });

  it('falls back to date strings, and returns nothing for empty values', () => {
    expect(parseTimestamp('2026-01-02T00:00:00Z')?.toISOString()).toBe('2026-01-02T00:00:00.000Z');
    expect(parseTimestamp(undefined)).toBeUndefined();
    expect(parseTimestamp(null)).toBeUndefined();
    expect(parseTimestamp('')).toBeUndefined();
  });

  it('gives an invalid date for garbage, which the modules reject', () => {
    expect(Number.isNaN(parseTimestamp('garbage')!.getTime())).toBe(true);
  });
});

describe('committee meetings actions', () => {
  let workspaceId: string;
  beforeEach(async () => {
    workspaceId = (await createMeetingsWorkspace({ name: 'W' }, 'u1'))._id;
  });

  const input = (extra: Record<string, unknown> = {}) => ({
    title: 'Board',
    startsAt: ms(DAY),
    endsAt: ms(DAY + HOUR),
    ...extra,
  });

  it('creates a meeting with the given zone and de-duplicated participants', async () => {
    const meeting = await createCommitteeMeeting(
      workspaceId,
      input({ location: 'Hall' }),
      ['p1', 'p2', 'p1'],
      'Asia/Karachi',
      'u1'
    );
    expect(meeting).toMatchObject({ title: 'Board', location: 'Hall', timeZone: 'Asia/Karachi' });
    expect(meeting.participants.map(p => p.participantId)).toEqual(['p1', 'p2']);
  });

  it('rejects missing or reversed times without leaving a meeting', async () => {
    await rejectsWith(
      createCommitteeMeeting(workspaceId, input({ startsAt: '' }), [], 'Asia/Karachi', 'u1'),
      'BAD_USER_INPUT'
    );
    await rejectsWith(
      createCommitteeMeeting(
        workspaceId,
        input({ startsAt: ms(DAY + HOUR), endsAt: ms(DAY) }),
        [],
        'Asia/Karachi',
        'u1'
      ),
      'BAD_USER_INPUT'
    );
    expect(await Meetings.find({}).countAsync()).toBe(0);
  });

  it('updates details, clearing omitted optional fields, and only reschedules when a time changed', async () => {
    const meeting = await createCommitteeMeeting(
      workspaceId,
      input({ location: 'Hall', description: 'd' }),
      ['p1'],
      'Asia/Karachi',
      'u1'
    );
    const same = await updateCommitteeMeeting(
      meeting,
      {
        title: 'Board 2',
        startsAt: String(meeting.startsAt.getTime()),
        endsAt: String(meeting.endsAt.getTime()),
      },
      'u1'
    );
    expect(same.title).toBe('Board 2');
    expect(same.location).toBeUndefined();
    expect(same.description).toBeUndefined();
    const actions = (await MeetingsActivities.find({ meetingId: meeting._id }).fetchAsync()).map(
      (a: any) => a.action
    );
    expect(actions).not.toContain('meeting-rescheduled');

    const moved = await updateCommitteeMeeting(
      same,
      { title: 'Board 2', startsAt: ms(2 * DAY), endsAt: ms(2 * DAY + HOUR) },
      'u1'
    );
    expect(moved.startsAt.getTime()).toBeGreaterThan(same.startsAt.getTime());
    expect(
      (await MeetingsActivities.find({ action: 'meeting-rescheduled' }).fetchAsync()).length
    ).toBe(1);
  });

  it('edits a completed meeting\'s details when the times are unchanged', async () => {
    const start = new Date(Date.now() - 3 * HOUR);
    const created = await createMeeting(
      { workspaceId, title: 'Past', startsAt: start, endsAt: new Date(start.getTime() + HOUR) },
      'u1'
    );
    const { completeMeeting } = await import('meteor/idreesia-common/server/business-logic/meetings');
    const completed = await completeMeeting(created._id, 'u1');
    await expect(
      updateCommitteeMeeting(
        completed,
        {
          title: 'Past (edited)',
          startsAt: String(completed.startsAt.getTime()),
          endsAt: String(completed.endsAt.getTime()),
        },
        'u1'
      )
    ).resolves.toMatchObject({ title: 'Past (edited)' });
  });

  it('makes the participant list exactly the wanted one, keeping existing responses', async () => {
    const meeting = await createCommitteeMeeting(workspaceId, input(), ['p1', 'p2'], 'Asia/Karachi', 'u1');
    await respondToInvitation(meeting._id, 'p1', { status: 'accepted' }, 'u1');
    const current = await getMeeting(meeting._id, 'u1');

    const updated = await setCommitteeMeetingParticipants(current, ['p1', 'p3'], 'u1');
    expect(updated.participants.map(p => p.participantId).sort()).toEqual(['p1', 'p3']);
    const kept = updated.participants.find(p => p.participantId === 'p1')!;
    expect(kept.rsvp.status).toBe('accepted');
    expect(updated.participants.find(p => p.participantId === 'p3')!.rsvp.status).toBe('pending');
  });

  it('returns the meeting untouched when the participants are already right', async () => {
    const meeting = await createCommitteeMeeting(workspaceId, input(), ['p1'], 'Asia/Karachi', 'u1');
    const same = await setCommitteeMeetingParticipants(meeting, ['p1'], 'u1');
    expect(same.revision).toBe(meeting.revision);
  });

  it('rolls back the removals when adding fails part-way', async () => {
    const meeting = await createCommitteeMeeting(workspaceId, input(), ['p1', 'p2'], 'Asia/Karachi', 'u1');
    // Removing p2 logs its entry (allowed); adding p3 then fails on its own entry.
    vi.spyOn(MeetingsActivities, 'insertAsync')
      .mockResolvedValueOnce('ok' as never)
      .mockRejectedValueOnce(new Error('log failed'));
    await expect(setCommitteeMeetingParticipants(meeting, ['p1', 'p3'], 'u1')).rejects.toThrow(
      'log failed'
    );
    vi.restoreAllMocks();
    const stored = await getMeeting(meeting._id, 'u1');
    expect(stored.participants.map(p => p.participantId).sort()).toEqual(['p1', 'p2']);
  });

  it('refuses roster changes on a cancelled meeting', async () => {
    const meeting = await createCommitteeMeeting(workspaceId, input(), ['p1'], 'Asia/Karachi', 'u1');
    const { cancelMeeting } = await import('meteor/idreesia-common/server/business-logic/meetings');
    const cancelled = await cancelMeeting(meeting._id, 'u1');
    await rejectsWith(setCommitteeMeetingParticipants(cancelled, ['p2'], 'u1'), 'CONFLICT');
  });
});

describe('committee polls actions', () => {
  let workspaceId: string;
  beforeEach(async () => {
    workspaceId = (await createPollsWorkspace({ name: 'W' }, 'u1'))._id;
  });

  const questions = [{ text: 'Where?', options: [{ text: 'Hall' }, { text: 'Garden' }] }];
  const input = (extra: Record<string, unknown> = {}) => ({
    title: 'Venue',
    closesAt: ms(DAY),
    questions,
    ...extra,
  });

  it('creates a draft poll, defaulting to named (not anonymous)', async () => {
    const poll = await createCommitteePoll(workspaceId, input(), 'u1');
    expect(poll).toMatchObject({ status: 'draft', anonymous: false });
    expect(poll.questions).toHaveLength(1);
    const anon = await createCommitteePoll(workspaceId, input({ anonymous: true }), 'u1');
    expect(anon.anonymous).toBe(true);
  });

  it('rejects an invalid end time', async () => {
    await rejectsWith(createCommitteePoll(workspaceId, input({ closesAt: '' }), 'u1'), 'BAD_USER_INPUT');
    expect(await Polls.find({}).countAsync()).toBe(0);
  });

  it('a draft takes every field, questions included', async () => {
    const poll = await createCommitteePoll(workspaceId, input(), 'u1');
    const updated = await updateCommitteePoll(
      poll,
      {
        title: 'New',
        closesAt: ms(2 * DAY),
        anonymous: true,
        questions: [{ text: 'When?', options: [{ text: 'Now' }, { text: 'Later' }] }],
      },
      'u1'
    );
    expect(updated.title).toBe('New');
    expect(updated.anonymous).toBe(true);
    expect(updated.questions[0].text).toBe('When?');
    expect(updated.closesAt.getTime()).toBeGreaterThan(poll.closesAt.getTime());
  });

  it('keeps anonymity when the form does not send it', async () => {
    const poll = await createCommitteePoll(workspaceId, input({ anonymous: true }), 'u1');
    const updated = await updateCommitteePoll(
      poll,
      { title: 'T2', closesAt: String(poll.closesAt.getTime()) },
      'u1'
    );
    expect(updated.anonymous).toBe(true);
  });

  it('an open poll ignores questions and anonymity changes but takes title and end time', async () => {
    const poll = await createCommitteePoll(workspaceId, input(), 'u1');
    await openPoll(poll._id, 'u1');
    const open = await getPoll(poll._id, 'u1');
    const updated = await updateCommitteePoll(
      open,
      {
        title: 'Renamed',
        closesAt: ms(3 * DAY),
        anonymous: true,
        questions: [{ text: 'Different?', options: [{ text: 'a' }, { text: 'b' }] }],
      },
      'u1'
    );
    expect(updated.title).toBe('Renamed');
    expect(updated.anonymous).toBe(false);
    expect(updated.questions[0].text).toBe('Where?');
    expect(updated.closesAt.getTime()).toBeGreaterThan(open.closesAt.getTime());
  });

  it('rolls back the details when the new questions are invalid', async () => {
    const poll = await createCommitteePoll(workspaceId, input(), 'u1');
    await rejectsWith(
      updateCommitteePoll(
        poll,
        { title: 'Changed', closesAt: String(poll.closesAt.getTime()), questions: [{ text: '', options: [] }] },
        'u1'
      ),
      'BAD_USER_INPUT'
    );
    expect((await getPoll(poll._id, 'u1')).title).toBe('Venue');
  });

  it('refuses to edit a closed poll', async () => {
    const poll = await createCommitteePoll(workspaceId, input(), 'u1');
    await openPoll(poll._id, 'u1');
    await castVote(
      poll._id,
      'p1',
      [{ questionId: poll.questions[0]._id, optionIds: [poll.questions[0].options[0]._id] }],
      'u1'
    );
    const { closePoll } = await import('meteor/idreesia-common/server/business-logic/polls');
    await closePoll(poll._id, 'u1');
    const closed = await getPoll(poll._id, 'u1');
    await rejectsWith(
      updateCommitteePoll(closed, { title: 'x', closesAt: String(closed.closesAt.getTime()) }, 'u1'),
      'CONFLICT'
    );
  });
});

describe('committee projects actions', () => {
  let workspaceId: string;
  beforeEach(async () => {
    workspaceId = (await createProjectsWorkspace({ name: 'W' }, 'u1'))._id;
  });

  const newProject = (extra: Record<string, unknown> = {}) =>
    createCommitteeProject(workspaceId, { title: 'Roof', participantIds: ['p1'], ...extra }, 'u1');

  it('creates a project from Workspaces input with timestamps as strings', async () => {
    const project = await newProject({
      startDate: ms(0),
      targetDate: ms(DAY),
      tags: ['x'],
      objective: 'Fix',
    });
    expect(project).toMatchObject({ title: 'Roof', objective: 'Fix', tags: ['x'], participantIds: ['p1'] });
    expect(project.startDate).toBeInstanceOf(Date);
    expect(project.targetDate).toBeInstanceOf(Date);
  });

  it('the edit form clears dates, objective and description that are no longer sent, and keeps tags if not sent', async () => {
    const project = await newProject({ startDate: ms(0), targetDate: ms(DAY), objective: 'o', tags: ['x'] });
    const updated = await updateCommitteeProject(project, { title: 'Roof 2' }, 'u1');
    expect(updated.title).toBe('Roof 2');
    expect(updated.objective).toBeUndefined();
    expect(updated.startDate).toBeUndefined();
    expect(updated.targetDate).toBeUndefined();
    expect(updated.tags).toEqual(['x']);
    const retagged = await updateCommitteeProject(updated, { title: 'Roof 2', tags: [] }, 'u1');
    expect(retagged.tags).toEqual([]);
  });

  it('changes status, honouring force, and deletes with the chosen task handling', async () => {
    const project = await newProject();
    await createCommitteeTask(workspaceId, project, { title: 'T' }, 'u1');
    await rejectsWith(setCommitteeProjectStatus(project._id, 'completed', false, 'u1'), 'CONFLICT');
    expect((await setCommitteeProjectStatus(project._id, 'completed', true, 'u1')).status).toBe('completed');
    await deleteCommitteeProject(project, { tasks: 'delete' }, 'u1');
    expect(await Projects.find({}).countAsync()).toBe(0);
    expect(await ProjectTasks.find({}).countAsync()).toBe(0);
  });

  it('only adds participants who are not already in the project', async () => {
    const project = await newProject();
    const same = await addCommitteeProjectParticipants(project, ['p1'], 'u1');
    expect(same).toBe(project);
    const updated = await addCommitteeProjectParticipants(project, ['p1', 'p2'], 'u1');
    expect(updated.participantIds.sort()).toEqual(['p1', 'p2']);
    const entry = (await ProjectsActivities.findOneAsync({ action: 'participants-added' })) as any;
    expect(entry.details.participantIds).toEqual(['p2']);
  });

  it('removes a participant, refusing while they have open tasks unless unassigning', async () => {
    const project = await newProject({ participantIds: ['p1', 'p2'] });
    const task = await createCommitteeTask(workspaceId, project, { title: 'T', assigneeId: 'p2' }, 'u1');
    await rejectsWith(removeCommitteeProjectParticipant(project, 'p2', false, 'u1'), 'CONFLICT');
    const updated = await removeCommitteeProjectParticipant(project, 'p2', true, 'u1');
    expect(updated.participantIds).toEqual(['p1']);
    expect((await getTask(task._id, 'u1')).assigneeId).toBeUndefined();
  });

  it('assigning a project task to a non-participant makes them a participant', async () => {
    const project = await newProject();
    const task = await createCommitteeTask(
      workspaceId,
      project,
      { title: 'T', assigneeId: 'p9', priority: 'high', dueDate: ms(DAY), tags: ['a'] },
      'u1'
    );
    expect(task).toMatchObject({ assigneeId: 'p9', priority: 'high', projectId: project._id, tags: ['a'] });
    expect((await getProject(project._id, 'u1')).participantIds).toContain('p9');
  });

  it('a standalone task needs no participant and an empty assignee means unassigned', async () => {
    const task = await createCommitteeTask(
      workspaceId,
      undefined,
      { title: 'T', assigneeId: '' },
      'u1'
    );
    expect(task.assigneeId).toBeUndefined();
    expect(task.projectId).toBeUndefined();
    expect(task.priority).toBe('normal');
  });

  it('rolls back the new participant when the task cannot be created', async () => {
    const project = await newProject();
    await rejectsWith(
      createCommitteeTask(workspaceId, project, { title: '  ', assigneeId: 'p9' }, 'u1'),
      'BAD_USER_INPUT'
    );
    expect((await getProject(project._id, 'u1')).participantIds).toEqual(['p1']);
    expect(await ProjectTasks.find({}).countAsync()).toBe(0);
  });

  it('updates a task through the edit form, adding the new assignee to the project and clearing what is not sent', async () => {
    const project = await newProject();
    const task = await createCommitteeTask(
      workspaceId,
      project,
      { title: 'T', assigneeId: 'p1', description: 'd', dueDate: ms(DAY), priority: 'low' },
      'u1'
    );
    const updated = await updateCommitteeTask(
      task,
      project,
      { title: 'T2', assigneeId: 'p2', priority: 'urgent' },
      'u1'
    );
    expect(updated).toMatchObject({ title: 'T2', assigneeId: 'p2', priority: 'urgent' });
    expect(updated.description).toBeUndefined();
    expect(updated.dueDate).toBeUndefined();
    expect((await getProject(project._id, 'u1')).participantIds).toContain('p2');

    const unassigned = await updateCommitteeTask(updated, project, { title: 'T2', assigneeId: null }, 'u1');
    expect(unassigned.assigneeId).toBeUndefined();
    expect(unassigned.priority).toBe('urgent');
  });

  it('refuses task changes on a completed project and leaves participants alone', async () => {
    const project = await newProject();
    const task = await createCommitteeTask(workspaceId, project, { title: 'T' }, 'u1');
    await setCommitteeProjectStatus(project._id, 'completed', true, 'u1');
    const closed = await getProject(project._id, 'u1');
    await rejectsWith(
      updateCommitteeTask(task, closed, { title: 'x', assigneeId: 'p9' }, 'u1'),
      'CONFLICT'
    );
    expect((await getProject(project._id, 'u1')).participantIds).toEqual(['p1']);
  });
});
