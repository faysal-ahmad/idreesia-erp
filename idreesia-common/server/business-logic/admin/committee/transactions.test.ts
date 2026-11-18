import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as chat from 'meteor/idreesia-common/server/chat';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { DiscussionsWorkspaces } from 'meteor/idreesia-common/server/collections/discussions';
import Committees from 'meteor/idreesia-common/server/collections/admin/committees';

import { discussionsHandler } from './discussions';
import type { CommitteeDoc } from './types';

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

// Enabling or disabling a feature runs the feature's handler and records the
// result on the committee in one transaction (as enableCommitteeFeature and
// disableCommitteeFeature do); chat changes the handler made are undone when
// it rolls back.

const committeeDoc = async () =>
  (await Committees.findOneAsync(committeeId)) as unknown as CommitteeDoc;

const enable = () =>
  runInTransaction(async () => {
    const data = await discussionsHandler.enable(await committeeDoc(), 'u1');
    await Committees.updateAsync(committeeId, {
      $addToSet: { features: 'discussions' },
      $set: { ...data },
    });
  });

const disable = () =>
  runInTransaction(async () => {
    await discussionsHandler.disable(await committeeDoc(), 'u1');
    await Committees.updateAsync(committeeId, {
      $pull: { features: 'discussions' },
    });
  });

let committeeId: string;

beforeEach(async () => {
  vi.clearAllMocks();
  chatMock.createChatGroup.mockResolvedValue({ _id: 'room1' } as never);
  chatMock.getChatGroupMemberIds.mockResolvedValue([]);
  committeeId = await Committees.insertAsync({
    name: 'Committee',
    members: [],
    features: [],
  } as any);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('committee feature transactions', () => {
  it('archives the new chat group and keeps no workspace when enabling fails', async () => {
    vi.spyOn(Committees, 'updateAsync').mockRejectedValueOnce(
      new Error('committee update failed')
    );

    await expect(enable()).rejects.toThrow('committee update failed');

    expect(chatMock.createChatGroup).toHaveBeenCalledOnce();
    expect(chatMock.archiveChatGroup).toHaveBeenCalledWith('room1');
    expect(await DiscussionsWorkspaces.find({}).countAsync()).toBe(0);
    expect((await Committees.findOneAsync(committeeId))?.features).toEqual([]);
  });

  it('keeps the chat group and records the workspace when enabling succeeds', async () => {
    await enable();

    expect(chatMock.archiveChatGroup).not.toHaveBeenCalled();
    const committee = (await Committees.findOneAsync(committeeId)) as any;
    expect(committee.features).toEqual(['discussions']);
    expect(
      await DiscussionsWorkspaces.findOneAsync(committee.discussionsWorkspaceId)
    ).toMatchObject({ chatGroupId: 'room1' });
  });

  it('unarchives the chat group again when disabling fails', async () => {
    await enable();
    chatMock.findChatGroup.mockResolvedValue({ _id: 'room1', archived: false } as never);
    vi.spyOn(Committees, 'updateAsync').mockRejectedValueOnce(
      new Error('committee update failed')
    );

    await expect(disable()).rejects.toThrow('committee update failed');

    expect(chatMock.archiveChatGroup).toHaveBeenCalledWith('room1');
    expect(chatMock.unarchiveChatGroup).toHaveBeenCalledWith('room1');
    const committee = (await Committees.findOneAsync(committeeId)) as any;
    expect(committee.features).toEqual(['discussions']);
    expect(
      (await DiscussionsWorkspaces.findOneAsync(committee.discussionsWorkspaceId))
        ?.deletedAt
    ).toBeUndefined();
  });
});
