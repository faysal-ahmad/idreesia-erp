import { beforeEach, describe, expect, it } from 'vitest';

import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  cancelMeeting,
  completeMeeting,
  createActionItem,
  createMeeting,
  createMeetingsWorkspace,
  respondToInvitation,
  setMinutes,
  markAttendance,
  addAgendaItem,
} from 'meteor/idreesia-common/server/business-logic/meetings';
import {
  castVote,
  closePoll,
  createPoll,
  createPollsWorkspace,
  openPoll,
  getPoll,
} from 'meteor/idreesia-common/server/business-logic/polls';
import {
  addTaskComment,
  createProject,
  createProjectsWorkspace,
  createTask,
  setProjectStatus,
  setTaskStatus,
} from 'meteor/idreesia-common/server/business-logic/projects';

import { getUserNames } from './documents-library';
import {
  areCommitteeMembers,
  getCommitteeMeeting,
  getCommitteeMeetingActivity,
  getCommitteeMeetingMembers,
  getCommitteeMeetingsInfo,
  listCommitteeActionItems,
  listCommitteeMeetings,
  type ViewContext,
} from './meetings-view';
import {
  getCommitteePoll,
  getCommitteePollActivity,
  getCommitteePollResults,
  getCommitteePollsInfo,
  listCommitteePolls,
} from './polls-view';
import {
  getCommitteeProjectMembers,
  getCommitteeProjectsActivity,
  getCommitteeProjectsInfo,
  getPeopleInProjectsOf,
  listCommitteeProjects,
  listCommitteeTaskComments,
  listCommitteeTasks,
  mapComments,
  toCommitteeTask,
} from './projects-view';
import type { CommitteeDoc } from './types';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const future = new Date(Date.now() + DAY);

const committee: CommitteeDoc = {
  _id: 'c1',
  name: 'Committee',
  members: [
    { karkunId: 'p1', role: 'coordinator' },
    { karkunId: 'p2' },
    { karkunId: 'p3' },
  ],
};

// u1 is the coordinator (person p1), u2 a member (p2).
const coordinator: ViewContext = { userId: 'u1', personId: 'p1', isCoordinator: true };
const member: ViewContext = { userId: 'u2', personId: 'p2', isCoordinator: false };
const noPerson: ViewContext = { userId: 'u9', personId: null, isCoordinator: false };

beforeEach(async () => {
  await People.insertAsync({ _id: 'p1', sharedData: { name: 'Zainab' } } as any);
  await People.insertAsync({ _id: 'p2', sharedData: { name: 'Ali' } } as any);
  await People.insertAsync({ _id: 'p3', sharedData: { name: 'Bilal' } } as any);
  await Users.insertAsync({ _id: 'u1', personId: 'p1', username: 'coord' } as any);
  await Users.insertAsync({ _id: 'u2', personId: 'p2', username: 'member' } as any);
  await Users.insertAsync({ _id: 'u3', username: 'plain', profile: { name: 'Profile Name' } } as any);
  await Users.insertAsync({ _id: 'u4', username: 'onlyusername' } as any);
});

describe('getUserNames', () => {
  it('prefers the person name, then the profile name, then the username', async () => {
    const names = await getUserNames(['u1', 'u3', 'u4', 'ghost', null, undefined, 'u1']);
    expect(names.get('u1')).toBe('Zainab');
    expect(names.get('u3')).toBe('Profile Name');
    expect(names.get('u4')).toBe('onlyusername');
    expect(names.has('ghost')).toBe(false);
    expect((await getUserNames([])).size).toBe(0);
  });
});

describe('meetings view', () => {
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
        participants: [{ participantId: 'p1' }, { participantId: 'p2' }],
        ...extra,
      } as any,
      'u1'
    );
  const past = (title = 'Past') => {
    const start = new Date(Date.now() - 3 * HOUR);
    return createMeeting(
      { workspaceId, title, startsAt: start, endsAt: new Date(start.getTime() + HOUR), participants: [{ participantId: 'p2' }] },
      'u1'
    );
  };

  it('shows who can manage and my participant id', async () => {
    const info = await getCommitteeMeetingsInfo(workspaceId, coordinator);
    expect(info).toMatchObject({ canManage: true, myParticipantId: 'p1', timeZone: 'Asia/Karachi' });
    expect(info.maxFileSize).toBe(100 * 1024 * 1024);
    expect((await getCommitteeMeetingsInfo(workspaceId, member)).canManage).toBe(false);
  });

  it('lists members by name with the coordinator flag', async () => {
    const members = await getCommitteeMeetingMembers(committee);
    expect(members.map(m => m.name)).toEqual(['Ali', 'Bilal', 'Zainab']);
    expect(members.find(m => m.participantId === 'p1')!.isCoordinator).toBe(true);
    expect(members.find(m => m.participantId === 'p2')!.isCoordinator).toBe(false);
    expect(await getCommitteeMeetingMembers({ _id: 'c', name: 'x' })).toEqual([]);
  });

  it('areCommitteeMembers accepts only members, ignoring empty ids', () => {
    expect(areCommitteeMembers(committee, ['p1', 'p2', null, undefined])).toBe(true);
    expect(areCommitteeMembers(committee, ['p1', 'stranger'])).toBe(false);
    expect(areCommitteeMembers({ _id: 'c', name: 'x' }, [])).toBe(true);
    expect(areCommitteeMembers({ _id: 'c', name: 'x' }, ['p1'])).toBe(false);
  });

  it('maps a meeting with names, string timestamps, and my RSVP', async () => {
    const m = await schedule();
    await respondToInvitation(m._id, 'p2', { status: 'accepted', comment: 'ok' }, 'u2');
    await addAgendaItem(m._id, { title: 'Budget', presenterId: 'p3' }, 'u1');
    await setMinutes(m._id, 'Notes', 'u2');

    const view = await getCommitteeMeeting(m._id, member);
    expect(view.startsAt).toBe(String(future.getTime()));
    expect(view.createdByName).toBe('Zainab');
    expect(view.myRsvpStatus).toBe('accepted');
    expect(view.participants.map(p => [p.name, p.isMe])).toEqual([
      ['Zainab', false],
      ['Ali', true],
    ]);
    expect(view.participants[1]).toMatchObject({ rsvpStatus: 'accepted', rsvpComment: 'ok' });
    expect(view.agenda[0]).toMatchObject({ title: 'Budget', presenterName: 'Bilal' });
    expect(view.minutes).toBe('Notes');
    expect(view.minutesUpdatedByName).toBe('Ali');
    expect(view.cancelledAt).toBeNull();
  });

  it('a user without a person is not a participant', async () => {
    const m = await schedule();
    const view = await getCommitteeMeeting(m._id, noPerson);
    expect(view.myRsvpStatus).toBeNull();
    expect(view.participants.every(p => !p.isMe)).toBe(true);
  });

  it('shows cancellation and attendance details with who did it', async () => {
    const done = await past('Done');
    await markAttendance(done._id, [{ participantId: 'p2', status: 'present', note: 'on time' }], 'u1');
    const viewDone = await getCommitteeMeeting(done._id, coordinator);
    expect(viewDone.participants[0]).toMatchObject({
      attendanceStatus: 'present',
      attendanceNote: 'on time',
      attendanceMarkedByName: 'Zainab',
    });
    const c = await schedule({ title: 'Cancelled' });
    await cancelMeeting(c._id, 'u2', { reason: 'clash' });
    const view = await getCommitteeMeeting(c._id, coordinator);
    expect(view).toMatchObject({ status: 'cancelled', cancelledByName: 'Ali', cancellationReason: 'clash' });
  });

  it('upcoming shows scheduled meetings that have not ended; past those that ended; cancelled separately', async () => {
    await schedule({ title: 'Soon' });
    const p = await past('Ended');
    await completeMeeting(p._id, 'u1');
    await past('Ended unmarked');
    const c = await schedule({ title: 'Cancelled' });
    await cancelMeeting(c._id, 'u1');

    const titles = async (view?: any, extra: any = {}) =>
      (await listCommitteeMeetings(workspaceId, coordinator, { view, ...extra })).data.map(m => m.title);
    expect(await titles()).toEqual(['Soon']);
    expect((await titles('past')).sort()).toEqual(['Ended', 'Ended unmarked']);
    expect(await titles('cancelled')).toEqual(['Cancelled']);
    expect((await titles('all')).sort()).toEqual(['Cancelled', 'Ended', 'Ended unmarked', 'Soon']);
  });

  it('a guest filter limits the list to meetings they are invited to, and text and paging work', async () => {
    await schedule({ title: 'Everyone' });
    await schedule({ title: 'Only p1', participants: [{ participantId: 'p1' }] });
    const guest = await listCommitteeMeetings(workspaceId, member, { participantId: 'p2' });
    expect(guest.data.map(m => m.title)).toEqual(['Everyone']);
    expect(guest.totalResults).toBe(1);
    const page = await listCommitteeMeetings(workspaceId, coordinator, { pageSize: 1, pageIndex: 1 });
    expect(page.data).toHaveLength(1);
    expect(page.totalResults).toBe(2);
  });

  it('action items: maps names and who can change them', async () => {
    const m = await schedule();
    const mine = await createActionItem(
      { meetingId: m._id, title: 'Mine', assigneeId: 'p2', dueDate: future },
      'u1'
    );
    await createActionItem({ meetingId: m._id, title: 'Theirs', assigneeId: 'p3' }, 'u1');
    await createActionItem({ meetingId: m._id, title: 'Nobody' }, 'u1');

    const asMember = await listCommitteeActionItems(workspaceId, member, {});
    const byTitle = Object.fromEntries(asMember.data.map(i => [i.title, i]));
    expect(byTitle.Mine).toMatchObject({
      assigneeName: 'Ali',
      canChangeStatus: true,
      meetingTitle: 'Board',
      createdByName: 'Zainab',
    });
    expect(byTitle.Theirs.canChangeStatus).toBe(false);
    expect(byTitle.Nobody.canChangeStatus).toBe(false);
    const asCoordinator = await listCommitteeActionItems(workspaceId, coordinator, {});
    expect(asCoordinator.data.every(i => i.canChangeStatus)).toBe(true);
    expect((await listCommitteeActionItems(workspaceId, noPerson, {})).data.every(i => !i.canChangeStatus)).toBe(true);

    const own = await listCommitteeActionItems(workspaceId, member, { assigneeId: 'me' });
    expect(own.data.map(i => i._id)).toEqual([mine._id]);
    const none = await listCommitteeActionItems(workspaceId, noPerson, { assigneeId: 'me' });
    expect(none.data).toEqual([]);
    const byStatus = await listCommitteeActionItems(workspaceId, coordinator, { status: ['done'] });
    expect(byStatus.data).toEqual([]);
  });

  it('action items: a guest only sees items of meetings they are invited to', async () => {
    const shared = await schedule({ title: 'Shared' });
    const hidden = await schedule({ title: 'Hidden', participants: [{ participantId: 'p1' }] });
    await createActionItem({ meetingId: shared._id, title: 'A' }, 'u1');
    await createActionItem({ meetingId: hidden._id, title: 'B' }, 'u1');
    const result = await listCommitteeActionItems(workspaceId, member, { participantId: 'p2' });
    expect(result.data.map(i => i.title)).toEqual(['A']);
    expect(
      (await listCommitteeActionItems(workspaceId, member, { participantId: 'p9' })).data
    ).toEqual([]);
  });

  it('activity: names the user and serialises details', async () => {
    const m = await schedule();
    const entries = await getCommitteeMeetingActivity(workspaceId, coordinator, { meetingId: m._id });
    expect(entries[0]).toMatchObject({ action: 'meeting-created', userName: 'Zainab', meetingId: m._id });
    expect(typeof entries[0].at).toBe('string');
    expect(JSON.parse(entries[0].details!).title).toBe('Board');
  });
});

describe('polls view', () => {
  let workspaceId: string;
  beforeEach(async () => {
    workspaceId = (await createPollsWorkspace({ name: 'W' }, 'u1'))._id;
  });

  const questions = [{ text: 'Where?', options: [{ text: 'Hall' }, { text: 'Garden' }] }];
  const draft = (extra: Record<string, unknown> = {}) =>
    createPoll({ workspaceId, title: 'Venue', closesAt: future, questions, ...extra } as any, 'u1');
  const open = async (extra: Record<string, unknown> = {}) => {
    const poll = await draft(extra);
    await openPoll(poll._id, 'u1');
    return getPoll(poll._id, 'u1');
  };
  const vote = (poll: any, voter: string, user: string, index = 0) =>
    castVote(
      poll._id,
      voter,
      [{ questionId: poll.questions[0]._id, optionIds: [poll.questions[0].options[index]._id] }],
      user
    );

  it('info tells who can manage and my voter id', () => {
    expect(getCommitteePollsInfo(coordinator)).toEqual({ canManage: true, myVoterId: 'p1' });
    expect(getCommitteePollsInfo(noPerson)).toEqual({ canManage: false, myVoterId: null });
  });

  it('eligibility needs a person and, when the committee is known, membership', async () => {
    const poll = await open();
    expect((await getCommitteePoll(poll._id, member)).isEligible).toBe(true);
    expect((await getCommitteePoll(poll._id, noPerson)).isEligible).toBe(false);
    const outsider: ViewContext & { committee: CommitteeDoc } = {
      userId: 'u7',
      personId: 'stranger',
      isCoordinator: false,
      committee,
    };
    expect((await getCommitteePoll(poll._id, outsider)).isEligible).toBe(false);
    expect(
      (await getCommitteePoll(poll._id, { ...member, committee } as any)).isEligible
    ).toBe(true);
  });

  it('shows my own answers and hasVoted, but not other people\'s', async () => {
    const poll = await open();
    await vote(poll, 'p2', 'u2');
    const mine = await getCommitteePoll(poll._id, member);
    expect(mine.hasVoted).toBe(true);
    expect(mine.myAnswers).toHaveLength(1);
    expect(mine.voteCount).toBe(1);
    const other = await getCommitteePoll(poll._id, coordinator);
    expect(other.hasVoted).toBe(false);
    expect(other.myAnswers).toBeNull();
    const nobody = await getCommitteePoll(poll._id, noPerson);
    expect(nobody.hasVoted).toBe(false);
  });

  it('only coordinators can see results of an open poll; everyone once it is closed', async () => {
    const poll = await open();
    await vote(poll, 'p2', 'u2');
    expect((await getCommitteePoll(poll._id, member)).canSeeResults).toBe(false);
    expect((await getCommitteePoll(poll._id, coordinator)).canSeeResults).toBe(true);
    await expect(getCommitteePollResults(poll._id, member)).rejects.toMatchObject({
      extensions: { code: 'CONFLICT' },
    });
    await expect(getCommitteePollResults(poll._id, coordinator)).resolves.toBeDefined();
    await closePoll(poll._id, 'u1');
    expect((await getCommitteePoll(poll._id, member)).canSeeResults).toBe(true);
    await expect(getCommitteePollResults(poll._id, member)).resolves.toBeDefined();
  });

  it('results name voters of a named poll, sorted by name, with counts and percentages', async () => {
    const poll = await open();
    await vote(poll, 'p1', 'u1');
    await vote(poll, 'p2', 'u2');
    await vote(poll, 'p3', 'u1', 1);
    await closePoll(poll._id, 'u1');
    const results = await getCommitteePollResults(poll._id, member);
    expect(results.totalVoters).toBe(3);
    const [hall, garden] = results.questions[0].options;
    expect(hall.count).toBe(2);
    expect(hall.voters!.map(v => v.name)).toEqual(['Ali', 'Zainab']);
    expect(garden.voters!.map(v => v.name)).toEqual(['Bilal']);
    expect(hall.percentage).toBeCloseTo(66.7, 0);
    expect(typeof results.closedAt).toBe('string');
  });

  it('results of an anonymous poll carry no voters', async () => {
    const poll = await open({ anonymous: true });
    await vote(poll, 'p2', 'u2');
    await closePoll(poll._id, 'u1');
    const results = await getCommitteePollResults(poll._id, member);
    expect(results.anonymous).toBe(true);
    expect(results.questions[0].options.every(o => o.voters === null)).toBe(true);
    expect(results.questions[0].options[0].count).toBe(1);
  });

  it('lists open, closed, drafts and all, hiding drafts from non-coordinators', async () => {
    await draft({ title: 'Draft' });
    await open({ title: 'Open' });
    const c = await open({ title: 'Closed' });
    await closePoll(c._id, 'u1');
    const titles = async (ctx: ViewContext, view?: any) =>
      (await listCommitteePolls(workspaceId, ctx, { view })).data.map(p => p.title).sort();
    expect(await titles(member)).toEqual(['Open']);
    expect(await titles(member, 'closed')).toEqual(['Closed']);
    expect(await titles(member, 'drafts')).toEqual([]);
    expect(await titles(coordinator, 'drafts')).toEqual(['Draft']);
    expect(await titles(member, 'all')).toEqual(['Closed', 'Open']);
    expect(await titles(coordinator, 'all')).toEqual(['Closed', 'Draft', 'Open']);
    const page = await listCommitteePolls(workspaceId, coordinator, { view: 'all', pageSize: 2 });
    expect(page.data).toHaveLength(2);
    expect(page.totalResults).toBe(3);
  });

  it('activity lists entries with user names', async () => {
    const poll = await open();
    const entries = await getCommitteePollActivity(workspaceId, coordinator, { pollId: poll._id });
    expect(entries.map(e => e.action)).toEqual(['poll-opened', 'poll-created']);
    expect(entries[0].userName).toBe('Zainab');
  });
});

describe('projects view', () => {
  let workspaceId: string;
  beforeEach(async () => {
    workspaceId = (await createProjectsWorkspace({ name: 'W' }, 'u1'))._id;
  });

  const project = (extra: Record<string, unknown> = {}) =>
    createProject({ workspaceId, title: 'Roof', participantIds: ['p1', 'p2'], ...extra }, 'u1');
  const task = (extra: Record<string, unknown> = {}) =>
    createTask({ workspaceId, title: 'Tiles', ...extra }, 'u1');
  const ctx = (c: ViewContext) => ({ ...c });

  it('info', () => {
    expect(getCommitteeProjectsInfo(coordinator)).toEqual({ canManage: true, myPersonId: 'p1' });
  });

  it('people in my projects: me plus co-participants only', async () => {
    await project({ participantIds: ['p2', 'p3'] });
    await project({ title: 'Other', participantIds: ['p1'] });
    expect([...(await getPeopleInProjectsOf(workspaceId, 'p2'))].sort()).toEqual(['p2', 'p3']);
    expect([...(await getPeopleInProjectsOf(workspaceId, 'p1'))]).toEqual(['p1']);
    expect([...(await getPeopleInProjectsOf(workspaceId, 'p9'))]).toEqual(['p9']);
    expect([...(await getPeopleInProjectsOf(workspaceId, null))]).toEqual([]);
  });

  it('project members can be limited to given people', async () => {
    const all = await getCommitteeProjectMembers(committee);
    expect(all.map(m => m.name)).toEqual(['Ali', 'Bilal', 'Zainab']);
    const limited = await getCommitteeProjectMembers(committee, new Set(['p3', 'p1']));
    expect(limited.map(m => m.personId)).toEqual(['p3', 'p1']);
  });

  it('maps a project: participants by name, ownership flags, overdue and open task counts', async () => {
    const p = await project({ targetDate: new Date(Date.now() - DAY), startDate: new Date(Date.now() - 2 * DAY) });
    const t1 = await task({ projectId: p._id });
    await task({ projectId: p._id });
    await setTaskStatus(t1._id, 'done', 'u1');
    const { getCommitteeProject } = await import('./projects-view');
    const asMember = await getCommitteeProject(p._id, ctx(member));
    expect(asMember.participants.map(x => x.name)).toEqual(['Ali', 'Zainab']);
    expect(asMember).toMatchObject({
      isParticipant: true,
      canManage: false,
      isOverdue: true,
      taskCount: 2,
      doneCount: 1,
      openTaskCount: 1,
      participantCount: 2,
    });
    const outsider = await getCommitteeProject(p._id, { ...noPerson });
    expect(outsider.isParticipant).toBe(false);
    expect((await getCommitteeProject(p._id, coordinator)).canManage).toBe(true);
  });

  it('a finished project is not overdue', async () => {
    const p = await project({ targetDate: new Date(Date.now() - DAY) });
    await setProjectStatus(p._id, 'completed', 'u1');
    const { getCommitteeProject } = await import('./projects-view');
    const view = await getCommitteeProject(p._id, coordinator);
    expect(view.isOverdue).toBe(false);
    expect(view.completedByName).toBe('Zainab');
  });

  it('lists active, completed, mine and all projects', async () => {
    await project({ title: 'Active' });
    const done = await project({ title: 'Done' });
    await setProjectStatus(done._id, 'completed', 'u1');
    const cancelled = await project({ title: 'Cancelled' });
    await setProjectStatus(cancelled._id, 'cancelled', 'u1');
    await project({ title: 'Not mine', participantIds: ['p3'] });
    const titles = async (c: ViewContext, view?: any, extra: any = {}) =>
      (await listCommitteeProjects(workspaceId, c, { view, ...extra })).data.map(p => p.title).sort();
    expect(await titles(coordinator)).toEqual(['Active', 'Not mine']);
    expect(await titles(coordinator, 'completed')).toEqual(['Cancelled', 'Done']);
    expect(await titles(member, 'mine')).toEqual(['Active']);
    expect(await titles(noPerson, 'mine')).toEqual([]);
    expect(await titles(coordinator, 'all')).toEqual(['Active', 'Cancelled', 'Done', 'Not mine']);
    expect(await titles(member, 'all', { participantId: 'p3' })).toEqual(['Not mine']);
  });

  it('maps a task: who can manage or update it, depending on the role and the project state', async () => {
    const p = await project();
    const t = await task({ projectId: p._id, assigneeId: 'p2' });
    expect(await toCommitteeTask(t, coordinator)).toMatchObject({
      canManage: true,
      canUpdate: true,
      assigneeName: 'Ali',
      projectTitle: 'Roof',
    });
    expect(await toCommitteeTask(t, member)).toMatchObject({ canManage: false, canUpdate: true });
    expect(await toCommitteeTask(t, { userId: 'u3', personId: 'p3', isCoordinator: false })).toMatchObject({
      canManage: false,
      canUpdate: false,
    });
    expect(await toCommitteeTask(t, noPerson)).toMatchObject({ canUpdate: false });

    await setProjectStatus(p._id, 'completed', 'u1', { force: true });
    expect(await toCommitteeTask(t, coordinator)).toMatchObject({ canManage: false, canUpdate: false });
    expect(await toCommitteeTask(t, member)).toMatchObject({ canUpdate: false });
  });

  it('a standalone task has no project title and is manageable by coordinators', async () => {
    const t = await task();
    expect(await toCommitteeTask(t, coordinator)).toMatchObject({
      projectId: null,
      projectTitle: null,
      canManage: true,
    });
  });

  it('lists tasks by view: open, mine, overdue, done, all', async () => {
    const past = new Date(Date.now() - DAY);
    await task({ title: 'open', assigneeId: 'p1' });
    await task({ title: 'mine', assigneeId: 'p2' });
    await task({ title: 'late', assigneeId: 'p2', dueDate: past });
    const d = await task({ title: 'done' });
    await setTaskStatus(d._id, 'done', 'u1');
    const x = await task({ title: 'cancelled' });
    await setTaskStatus(x._id, 'cancelled', 'u1');
    const titles = async (c: ViewContext, view?: any, extra: any = {}) =>
      (await listCommitteeTasks(workspaceId, c, { view, ...extra })).data.map(t => t.title).sort();
    expect(await titles(coordinator)).toEqual(['late', 'mine', 'open']);
    expect(await titles(member, 'mine')).toEqual(['late', 'mine']);
    expect(await titles(noPerson, 'mine')).toEqual([]);
    expect(await titles(coordinator, 'overdue')).toEqual(['late']);
    expect(await titles(coordinator, 'done')).toEqual(['cancelled', 'done']);
    expect(await titles(coordinator, 'all')).toHaveLength(5);
    expect(await titles(coordinator, 'all', { assigneeId: 'p1' })).toEqual(['open']);
    expect(await titles(coordinator, 'all', { standalone: true })).toHaveLength(5);
  });

  it('a guest sees only tasks of projects they take part in', async () => {
    const mine = await project({ participantIds: ['p2'] });
    const theirs = await project({ title: 'Other', participantIds: ['p3'] });
    await task({ title: 'in mine', projectId: mine._id });
    await task({ title: 'in theirs', projectId: theirs._id });
    await task({ title: 'standalone' });
    const result = await listCommitteeTasks(workspaceId, member, { view: 'all', participantId: 'p2' });
    expect(result.data.map(t => t.title)).toEqual(['in mine']);
    const none = await listCommitteeTasks(workspaceId, member, { view: 'all', participantId: 'p9' });
    expect(none.data).toEqual([]);
    expect(none.totalResults).toBe(0);
  });

  it('comments: own flag and delete rights follow the author and the coordinator role', async () => {
    const t = await task();
    await addTaskComment(t._id, 'by member', 'u2');
    await addTaskComment(t._id, 'by coordinator', 'u1');
    const asMember = await listCommitteeTaskComments(t._id, member, {});
    expect(asMember.data.map(c => [c.text, c.isOwn, c.canDelete, c.authorName])).toEqual([
      ['by member', true, true, 'Ali'],
      ['by coordinator', false, false, 'Zainab'],
    ]);
    const asCoordinator = await listCommitteeTaskComments(t._id, coordinator, {});
    expect(asCoordinator.data.every(c => c.canDelete)).toBe(true);
    expect(asCoordinator.totalResults).toBe(2);
    const stored = await listCommitteeTaskComments(t._id, member, { pageSize: 1, pageIndex: 1 });
    expect(stored.data.map(c => c.text)).toEqual(['by coordinator']);
    expect(await mapComments([], member)).toEqual([]);
  });

  it('activity: filters by project or task and names the user', async () => {
    const p = await project();
    const t = await task({ projectId: p._id });
    const forProject = await getCommitteeProjectsActivity(workspaceId, coordinator, { projectId: p._id });
    expect(forProject.map(e => e.action).sort()).toEqual(['project-created', 'task-created']);
    const forTask = await getCommitteeProjectsActivity(workspaceId, coordinator, { taskId: t._id });
    expect(forTask).toHaveLength(1);
    expect(forTask[0]).toMatchObject({ userName: 'Zainab', taskId: t._id, projectId: p._id });
    const limited = await getCommitteeProjectsActivity(workspaceId, coordinator, { limit: 1 });
    expect(limited).toHaveLength(1);
  });
});
