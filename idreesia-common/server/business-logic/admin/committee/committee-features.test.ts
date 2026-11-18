import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as chat from 'meteor/idreesia-common/server/chat';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import Notifications from 'meteor/idreesia-common/server/collections/common/notifications';
import { DiscussionsWorkspaces } from 'meteor/idreesia-common/server/collections/discussions';
import { DmsWorkspaces } from 'meteor/idreesia-common/server/collections/dms';
import Committees from 'meteor/idreesia-common/server/collections/admin/committees';
import { MeetingsWorkspaces } from 'meteor/idreesia-common/server/collections/meetings';
import { PollsWorkspaces } from 'meteor/idreesia-common/server/collections/polls';
import { ProjectsWorkspaces } from 'meteor/idreesia-common/server/collections/projects';
import { createNotifier } from 'meteor/idreesia-common/server/headless';

import {
  disableCommitteeFeature,
  enableCommitteeFeature,
  runMemberHooks,
} from './committee-features';
import {
  getCommitteeDiscussionChatUserIds,
  getCommitteeDiscussionsWorkspaceId,
  setCommitteeMemberDiscussionAccess,
} from './discussions';
import { getCommitteeMeetingsWorkspaceId } from './meetings';
import { getCommitteeMemberAccess } from './member-access';
import {
  getMyNotificationCounts,
  getMyNotifications,
  markMyNotificationsRead,
} from './notifications';
import type { CommitteeDoc } from './types';

// The security-server barrel loads native image libraries.
vi.mock('meteor/idreesia-common/server/business-logic/security/security-server', () => ({}));
vi.mock(
  'meteor/idreesia-common/server/business-logic/security/security-server/profile-search',
  () => ({ getSecurityServerProfiles: vi.fn() })
);
vi.mock(
  'meteor/idreesia-common/server/business-logic/security/security-server/alert-search',
  () => ({ getSecurityServerAlerts: vi.fn() })
);
vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);
vi.mock('meteor/idreesia-common/server/chat', async importOriginal => ({
  ...(await importOriginal<typeof import('meteor/idreesia-common/server/chat')>()),
  findChatGroup: vi.fn(),
  createChatGroup: vi.fn(),
  archiveChatGroup: vi.fn(),
  unarchiveChatGroup: vi.fn(),
  addChatGroupMembers: vi.fn(),
  removeChatGroupMember: vi.fn(),
  getChatGroupMemberIds: vi.fn(),
}));
const chatMock = vi.mocked(chat);

const rejectsWith = async (promise: Promise<unknown>, code: string) => {
  await expect(promise).rejects.toMatchObject({ extensions: { code } });
};

let committeeId: string;
const committee = async () =>
  (await Committees.findOneAsync(committeeId)) as unknown as CommitteeDoc & Record<string, any>;

beforeEach(async () => {
  vi.clearAllMocks();
  chatMock.createChatGroup.mockResolvedValue({ _id: 'room1' } as never);
  chatMock.getChatGroupMemberIds.mockResolvedValue([]);
  committeeId = await Committees.insertAsync({
    name: 'Finance',
    members: [{ karkunId: 'p1' }],
    features: [],
  } as any);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('enable / disable committee features', () => {
  it('rejects unknown features and missing committees', async () => {
    await rejectsWith(enableCommitteeFeature(committeeId, 'teleport', 'u1'), 'BAD_USER_INPUT');
    await rejectsWith(enableCommitteeFeature('nope', 'meetings', 'u1'), 'NOT_FOUND');
    await rejectsWith(disableCommitteeFeature('nope', 'meetings', 'u1'), 'NOT_FOUND');
    await rejectsWith(disableCommitteeFeature(committeeId, 'teleport', 'u1'), 'BAD_USER_INPUT');
  });

  it.each([
    ['meetings', MeetingsWorkspaces, 'meetingsWorkspaceId'],
    ['polls', PollsWorkspaces, 'pollsWorkspaceId'],
    ['projects', ProjectsWorkspaces, 'projectsWorkspaceId'],
    ['documents', DmsWorkspaces, 'dmsWorkspaceId'],
  ] as const)('%s: creates a workspace named after the committee, records audit fields', async (key, collection, field) => {
    await enableCommitteeFeature(committeeId, key, 'u1');
    const c = await committee();
    expect(c.features).toEqual([key]);
    expect(c.updatedBy).toBe('u1');
    const workspace = (await (collection as any).findOneAsync(c[field])) as any;
    expect(workspace.name).toContain('Finance');
    expect(workspace.metadata).toEqual({ committeeId });
    expect(workspace.deletedAt).toBeUndefined();
  });

  it('enabling twice keeps one feature entry and one workspace', async () => {
    await enableCommitteeFeature(committeeId, 'meetings', 'u1');
    await enableCommitteeFeature(committeeId, 'meetings', 'u1');
    expect((await committee()).features).toEqual(['meetings']);
    expect(await MeetingsWorkspaces.find({}).countAsync()).toBe(1);
  });

  it('disabling archives the workspace; re-enabling restores the same one', async () => {
    await enableCommitteeFeature(committeeId, 'meetings', 'u1');
    const { meetingsWorkspaceId } = await committee();
    await disableCommitteeFeature(committeeId, 'meetings', 'u2');
    const afterDisable = await committee();
    expect(afterDisable.features).toEqual([]);
    expect(afterDisable.meetingsWorkspaceId).toBe(meetingsWorkspaceId);
    expect(afterDisable.updatedBy).toBe('u2');
    expect(((await MeetingsWorkspaces.findOneAsync(meetingsWorkspaceId)) as any).deletedAt).toBeInstanceOf(Date);

    await enableCommitteeFeature(committeeId, 'meetings', 'u1');
    const afterEnable = await committee();
    expect(afterEnable.meetingsWorkspaceId).toBe(meetingsWorkspaceId);
    expect(((await MeetingsWorkspaces.findOneAsync(meetingsWorkspaceId)) as any).deletedAt).toBeUndefined();
    expect(await MeetingsWorkspaces.find({}).countAsync()).toBe(1);
  });

  it('creates a new workspace when the remembered one was purged', async () => {
    await enableCommitteeFeature(committeeId, 'polls', 'u1');
    const first = (await committee()).pollsWorkspaceId;
    await disableCommitteeFeature(committeeId, 'polls', 'u1');
    await PollsWorkspaces.removeAsync(first!);
    await enableCommitteeFeature(committeeId, 'polls', 'u1');
    expect((await committee()).pollsWorkspaceId).not.toBe(first);
  });

  it('disabling a feature that was never enabled is harmless', async () => {
    await expect(disableCommitteeFeature(committeeId, 'projects', 'u1')).resolves.toBe(true);
    expect((await committee()).features).toEqual([]);
  });

  it('features without outside setup just toggle', async () => {
    for (const key of ['members', 'night-stay-report', 'monitoring-alerts', 'monitoring-profiles']) {
      await enableCommitteeFeature(committeeId, key, 'u1');
    }
    expect((await committee()).features).toHaveLength(4);
    await disableCommitteeFeature(committeeId, 'members', 'u1');
    expect((await committee()).features).not.toContain('members');
  });

  it('rolls back a new workspace when recording the feature fails', async () => {
    vi.spyOn(Committees, 'updateAsync').mockRejectedValueOnce(new Error('update failed'));
    await expect(enableCommitteeFeature(committeeId, 'meetings', 'u1')).rejects.toThrow('update failed');
    expect(await MeetingsWorkspaces.find({}).countAsync()).toBe(0);
    expect((await committee()).features).toEqual([]);
  });

  it('reports chat failures as FEATURE_ACTION_FAILED and changes nothing', async () => {
    chatMock.createChatGroup.mockRejectedValueOnce(new Error('chat down'));
    await expect(enableCommitteeFeature(committeeId, 'discussions', 'u1')).rejects.toMatchObject({
      message: expect.stringContaining('chat down'),
      extensions: { code: 'FEATURE_ACTION_FAILED' },
    });
    expect((await committee()).features).toEqual([]);
    expect(await DiscussionsWorkspaces.find({}).countAsync()).toBe(0);
  });
});

describe('discussions helpers and member hooks', () => {
  beforeEach(async () => {
    await Users.insertAsync({ _id: 'u1', personId: 'p1', chatUserId: 'chat-p1' } as any);
    await Users.insertAsync({ _id: 'u2', personId: 'p2' } as any);
    await Committees.updateAsync(committeeId, {
      $set: { members: [{ karkunId: 'p1' }, { karkunId: 'p2' }, { karkunId: 'p3' }] },
    });
  });

  it('the workspace id lookups throw NOT_FOUND until Discussions is enabled', async () => {
    const c = await committee();
    expect(() => getCommitteeDiscussionsWorkspaceId(c)).toThrowError(/not enabled/);
    expect(() => getCommitteeMeetingsWorkspaceId(c)).toThrowError(/not enabled/);
    expect(await getCommitteeDiscussionChatUserIds(c)).toBeNull();
    await enableCommitteeFeature(committeeId, 'discussions', 'u1');
    const enabled = await committee();
    expect(getCommitteeDiscussionsWorkspaceId(enabled)).toBe(enabled.discussionsWorkspaceId);
  });

  it('enabling adds the members who have a user to the chat group', async () => {
    await enableCommitteeFeature(committeeId, 'discussions', 'u1');
    expect(chatMock.addChatGroupMembers).toHaveBeenCalled();
  });

  it('member hooks run only for enabled features and wrap failures', async () => {
    const c = await committee();
    await expect(runMemberHooks(c, 'memberAdded', 'p1')).resolves.toBeUndefined();
    expect(chatMock.addChatGroupMembers).not.toHaveBeenCalled();

    await enableCommitteeFeature(committeeId, 'discussions', 'u1');
    chatMock.addChatGroupMembers.mockClear();
    const enabled = await committee();
    await runMemberHooks(enabled, 'memberAdded', 'p1');
    expect(chatMock.addChatGroupMembers).toHaveBeenCalledOnce();
    await runMemberHooks(enabled, 'memberAdded', 'p3'); // no user: nothing to add
    expect(chatMock.addChatGroupMembers).toHaveBeenCalledOnce();

    chatMock.getChatGroupMemberIds.mockResolvedValue(['chat-p1'] as never);
    chatMock.removeChatGroupMember.mockRejectedValueOnce(new Error('chat down'));
    await expect(runMemberHooks(enabled, 'memberRemoved', 'p1')).rejects.toMatchObject({
      message: expect.stringContaining('remove the member from the committee discussion'),
      extensions: { code: 'FEATURE_ACTION_FAILED' },
    });
  });

  it('ignores unknown feature keys on the committee when running hooks', async () => {
    const c = { ...(await committee()), features: ['legacy-thing'] };
    await expect(runMemberHooks(c, 'memberAdded', 'p1')).resolves.toBeUndefined();
  });

  it('member discussion access: validates feature, membership and chat account', async () => {
    const before = await committee();
    await rejectsWith(setCommitteeMemberDiscussionAccess(before, 'p1', true), 'BAD_USER_INPUT');
    await enableCommitteeFeature(committeeId, 'discussions', 'u1');
    const c = await committee();
    await rejectsWith(setCommitteeMemberDiscussionAccess(c, 'stranger', true), 'BAD_USER_INPUT');
    await rejectsWith(setCommitteeMemberDiscussionAccess(c, 'p2', true), 'BAD_USER_INPUT'); // no chat account
    chatMock.addChatGroupMembers.mockClear();
    await expect(setCommitteeMemberDiscussionAccess(c, 'p1', true)).resolves.toBe(true);
    expect(chatMock.addChatGroupMembers).toHaveBeenCalled();
    chatMock.getChatGroupMemberIds.mockResolvedValue(['chat-p1'] as never);
    await expect(setCommitteeMemberDiscussionAccess(c, 'p1', false)).resolves.toBe(true);
    expect(chatMock.removeChatGroupMember).toHaveBeenCalled();
  });

  it('member access: login and chat accounts, discussion access unknown without Discussions', async () => {
    const access = await getCommitteeMemberAccess(await committee());
    expect(access.get('p1')).toEqual({ hasLoginAccount: true, hasChatAccount: true, hasDiscussionAccess: null });
    expect(access.get('p2')).toEqual({ hasLoginAccount: true, hasChatAccount: false, hasDiscussionAccess: null });
    expect(access.get('p3')).toEqual({ hasLoginAccount: false, hasChatAccount: false, hasDiscussionAccess: null });
    expect((await getCommitteeMemberAccess({ _id: 'c', name: 'x', members: [] })).size).toBe(0);
    expect((await getCommitteeMemberAccess({ _id: 'c', name: 'x' })).size).toBe(0);
  });

  it('member access: discussion access follows the chat group, and chat failures leave it unknown', async () => {
    await enableCommitteeFeature(committeeId, 'discussions', 'u1');
    const c = await committee();
    chatMock.getChatGroupMemberIds.mockResolvedValue(['chat-p1'] as never);
    const access = await getCommitteeMemberAccess(c);
    expect(access.get('p1')!.hasDiscussionAccess).toBe(true);
    expect(access.get('p2')!.hasDiscussionAccess).toBe(false);
    expect(access.get('p3')!.hasDiscussionAccess).toBe(false);

    chatMock.getChatGroupMemberIds.mockRejectedValue(new Error('chat down'));
    const unknown = await getCommitteeMemberAccess(c);
    expect(unknown.get('p1')!.hasDiscussionAccess).toBeNull();
    expect(unknown.get('p1')!.hasLoginAccount).toBe(true);
  });
});

describe('my notifications', () => {
  const dms = createNotifier('dms');
  const polls = createNotifier('polls');
  const user = { _id: 'u1', personId: 'p1' };
  let other: string;

  const publish = (notifier: ReturnType<typeof createNotifier>, id: string, workspaceId: string, extra = {}) =>
    notifier.publish({
      id,
      workspaceId,
      entityType: 'thing',
      entityId: 'e1',
      eventType: 'created',
      eventDetails: `Event ${id}`,
      createdAt: new Date(),
      ...extra,
    } as any);

  beforeEach(async () => {
    await Committees.updateAsync(committeeId, {
      $set: { dmsWorkspaceId: 'dmsW', pollsWorkspaceId: 'pollsW', features: ['documents'] },
    });
    other = await Committees.insertAsync({
      name: 'Other',
      members: [{ karkunId: 'p2' }],
      features: ['documents'],
      dmsWorkspaceId: 'otherDms',
    } as any);
  });

  it('shows only modules enabled on committees the person belongs to', async () => {
    await publish(dms, 'a', 'dmsW');
    await publish(polls, 'b', 'pollsW'); // polls feature is not enabled
    await publish(dms, 'c', 'otherDms'); // not my committee
    const mine = await getMyNotifications(user);
    expect(mine.map(n => n._id)).toEqual(['dms:a']);
    expect(mine[0]).toMatchObject({ committeeId, module: 'dms', isRead: false, recipientUserId: null, data: null });
    expect(other).toBeDefined();
  });

  it('only shows what is addressed to the user or to everyone', async () => {
    await publish(dms, 'mine', 'dmsW', { recipientUserId: 'u1' });
    await publish(dms, 'theirs', 'dmsW', { recipientUserId: 'u2' });
    await publish(dms, 'all', 'dmsW');
    expect((await getMyNotifications(user)).map(n => n._id).sort()).toEqual(['dms:all', 'dms:mine']);
  });

  it('returns nothing for a user without a person or id', async () => {
    await publish(dms, 'a', 'dmsW');
    expect(await getMyNotifications({ _id: 'u1' })).toEqual([]);
    expect(await getMyNotifications({ personId: 'p1' })).toEqual([]);
    expect(await getMyNotifications(null)).toEqual([]);
    expect(await getMyNotificationCounts(undefined)).toEqual([]);
    await expect(markMyNotificationsRead(null, ['dms:a'])).resolves.toBe(true);
  });

  it('filters by committee and module, and pages', async () => {
    await publish(dms, 'a', 'dmsW');
    await publish(dms, 'b', 'dmsW');
    expect(await getMyNotifications(user, { module: 'polls' })).toEqual([]);
    expect(await getMyNotifications(user, { committeeId: other })).toEqual([]);
    expect(await getMyNotifications(user, { committeeId, module: 'dms' })).toHaveLength(2);
    expect(await getMyNotifications(user, { limit: 1 })).toHaveLength(1);
    expect(await getMyNotifications(user, { limit: 1, offset: 1 })).toHaveLength(1);
  });

  it('counts unread per committee and module and marks read only what the user can see', async () => {
    await publish(dms, 'a', 'dmsW');
    await publish(dms, 'b', 'dmsW');
    await publish(dms, 'hidden', 'otherDms');
    expect(await getMyNotificationCounts(user)).toEqual([{ committeeId, module: 'dms', unreadCount: 2 }]);

    await markMyNotificationsRead(user, ['dms:a', 'dms:hidden']);
    expect(await getMyNotificationCounts(user)).toEqual([{ committeeId, module: 'dms', unreadCount: 1 }]);
    const read = (await getMyNotifications(user)).find(n => n._id === 'dms:a')!;
    expect(read.isRead).toBe(true);
    // The other committee's notification stays unread for its own members.
    expect(await Notifications.find({ _id: 'dms:hidden' }).countAsync()).toBe(1);
    const otherCounts = await getMyNotificationCounts({ _id: 'u2', personId: 'p2' });
    expect(otherCounts).toEqual([{ committeeId: other, module: 'dms', unreadCount: 1 }]);
  });
});
