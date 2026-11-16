import { beforeEach, describe, expect, it, vi } from 'vitest';

const chat = vi.hoisted(() => ({
  findChatGroup: vi.fn(),
  getChatGroupMemberIds: vi.fn(),
  createChatGroup: vi.fn(),
  archiveChatGroup: vi.fn(),
  unarchiveChatGroup: vi.fn(),
  addChatGroupMembers: vi.fn(),
  removeChatGroupMember: vi.fn(),
}));
vi.mock('meteor/idreesia-common/server/chat', () => chat);

const { Users } = await import('meteor/idreesia-common/server/collections/admin');
const { DiscussionsWorkspaces } = await import(
  'meteor/idreesia-common/server/collections/discussions'
);
const {
  discussionsModule,
  findDiscussionsWorkspace,
  getDiscussionChatGroupId,
  getDiscussionsWorkspaceChatUserIds,
  restoreDiscussionsWorkspace,
} = await import('./index');

beforeEach(() => {
  vi.resetAllMocks();
  chat.createChatGroup.mockImplementation(async (name: string) => ({
    _id: 'g-new',
    name,
  }));
  chat.getChatGroupMemberIds.mockResolvedValue([]);
});

const create = (name = 'Team Plans') =>
  discussionsModule.createWorkspace({ name, createdBy: 'u1' } as any);

describe('createWorkspace', () => {
  it('creates a chat group and the workspace pointing at it', async () => {
    const ref = await create();
    expect(ref).toEqual({ module: 'discussions', workspaceId: expect.any(String) });
    const workspace = await DiscussionsWorkspaces.findOneAsync(ref.workspaceId);
    expect(workspace).toMatchObject({
      name: 'Team Plans',
      chatGroupId: 'g-new',
      createdBy: 'u1',
      updatedBy: 'u1',
    });
  });

  it('builds a chat-safe unique group name', async () => {
    await create('  Ünï Café & Co!! ');
    await create('!!!');
    const [first] = chat.createChatGroup.mock.calls[0];
    const [second] = chat.createChatGroup.mock.calls[1];
    expect(first).toMatch(/^discussions-n-caf-co-[0-9a-f]{6}$/);
    expect(second).toMatch(/^discussions-group-[0-9a-f]{6}$/);
  });

  it('stores metadata only when given', async () => {
    const withMeta = await discussionsModule.createWorkspace({
      name: 'A',
      createdBy: 'u1',
      metadata: { k: 1 },
    } as any);
    const without = await create('B');
    expect((await findDiscussionsWorkspace(withMeta.workspaceId))?.metadata).toEqual({ k: 1 });
    expect(await findDiscussionsWorkspace(without.workspaceId)).not.toHaveProperty('metadata');
  });

  it('archives the new chat group and stores no workspace when the insert fails', async () => {
    vi.spyOn(DiscussionsWorkspaces, 'insertAsync').mockRejectedValueOnce(new Error('db down'));
    await expect(create()).rejects.toThrow('db down');
    expect(chat.archiveChatGroup).toHaveBeenCalledWith('g-new');
    expect(await DiscussionsWorkspaces.find({}).countAsync()).toBe(0);
  });
});

describe('lookups', () => {
  it('returns null for an unknown workspace and the group id for a known one', async () => {
    expect(await findDiscussionsWorkspace('nope')).toBeNull();
    const { workspaceId } = await create();
    expect(await getDiscussionChatGroupId(workspaceId)).toBe('g-new');
  });

  it('throws NOT_FOUND for unknown or archived workspaces', async () => {
    await expect(getDiscussionChatGroupId('nope')).rejects.toMatchObject({
      message: 'Discussions workspace not found.',
      extensions: { code: 'NOT_FOUND' },
    });
    const { workspaceId } = await create();
    chat.findChatGroup.mockResolvedValue({ _id: 'g-new', archived: false });
    await discussionsModule.archiveWorkspace({ workspaceId } as any, 'u1');
    await expect(getDiscussionChatGroupId(workspaceId)).rejects.toThrow('not found');
    // ... but archived ones can still be found.
    expect(await findDiscussionsWorkspace(workspaceId)).not.toBeNull();
  });

  it('lists the chat user ids of the group', async () => {
    const { workspaceId } = await create();
    chat.getChatGroupMemberIds.mockResolvedValue(['c1', 'c2', 'c1']);
    expect(await getDiscussionsWorkspaceChatUserIds(workspaceId)).toEqual(
      new Set(['c1', 'c2'])
    );
    expect(chat.getChatGroupMemberIds).toHaveBeenCalledWith('g-new');
  });
});

describe('archiveWorkspace', () => {
  it('archives the group and soft-deletes the workspace', async () => {
    const { workspaceId } = await create();
    chat.findChatGroup.mockResolvedValue({ _id: 'g-new', archived: false });
    await discussionsModule.archiveWorkspace({ workspaceId } as any, 'u2');
    expect(chat.archiveChatGroup).toHaveBeenCalledWith('g-new');
    const workspace = await findDiscussionsWorkspace(workspaceId);
    expect(workspace?.deletedAt).toBeInstanceOf(Date);
    expect(workspace?.deletedBy).toBe('u2');
  });

  it('is a no-op for an already archived workspace', async () => {
    const { workspaceId } = await create();
    chat.findChatGroup.mockResolvedValue({ _id: 'g-new', archived: false });
    await discussionsModule.archiveWorkspace({ workspaceId } as any, 'u2');
    chat.archiveChatGroup.mockClear();
    await discussionsModule.archiveWorkspace({ workspaceId } as any, 'u3');
    expect(chat.archiveChatGroup).not.toHaveBeenCalled();
    expect((await findDiscussionsWorkspace(workspaceId))?.deletedBy).toBe('u2');
  });

  it('does not archive a group that is already archived or gone', async () => {
    const { workspaceId } = await create();
    chat.findChatGroup.mockResolvedValue(null);
    await discussionsModule.archiveWorkspace({ workspaceId } as any, 'u1');
    expect(chat.archiveChatGroup).not.toHaveBeenCalled();
    expect((await findDiscussionsWorkspace(workspaceId))?.deletedAt).toBeInstanceOf(Date);
  });

  it('throws NOT_FOUND for an unknown workspace', async () => {
    await expect(
      discussionsModule.archiveWorkspace({ workspaceId: 'nope' } as any, 'u1')
    ).rejects.toThrow('not found');
  });

  it('un-archives the chat group again when the workspace update fails', async () => {
    const { workspaceId } = await create();
    chat.findChatGroup.mockResolvedValue({ _id: 'g-new', archived: false });
    vi.spyOn(DiscussionsWorkspaces, 'updateAsync').mockRejectedValueOnce(new Error('db down'));
    await expect(
      discussionsModule.archiveWorkspace({ workspaceId } as any, 'u1')
    ).rejects.toThrow('db down');
    expect(chat.unarchiveChatGroup).toHaveBeenCalledWith('g-new');
    expect((await findDiscussionsWorkspace(workspaceId))?.deletedAt).toBeUndefined();
  });
});

describe('restoreDiscussionsWorkspace', () => {
  const archived = async () => {
    const { workspaceId } = await create();
    chat.findChatGroup.mockResolvedValue({ _id: 'g-new', archived: false });
    await discussionsModule.archiveWorkspace({ workspaceId } as any, 'u1');
    vi.clearAllMocks();
    return workspaceId;
  };

  it('un-archives the existing chat group and clears the deletion', async () => {
    const workspaceId = await archived();
    chat.findChatGroup.mockResolvedValue({ _id: 'g-new', archived: true });
    const ref = await restoreDiscussionsWorkspace(workspaceId, 'u9');
    expect(ref).toEqual({ module: 'discussions', workspaceId });
    expect(chat.unarchiveChatGroup).toHaveBeenCalledWith('g-new');
    const workspace = await findDiscussionsWorkspace(workspaceId);
    expect(workspace?.deletedAt).toBeUndefined();
    expect(workspace?.deletedBy).toBeUndefined();
    expect(workspace?.updatedBy).toBe('u9');
  });

  it('does not touch a group that is not archived', async () => {
    const workspaceId = await archived();
    chat.findChatGroup.mockResolvedValue({ _id: 'g-new', archived: false });
    await restoreDiscussionsWorkspace(workspaceId, 'u9');
    expect(chat.unarchiveChatGroup).not.toHaveBeenCalled();
    expect(chat.createChatGroup).not.toHaveBeenCalled();
  });

  it('creates a new chat group when the old one no longer exists', async () => {
    const workspaceId = await archived();
    chat.findChatGroup.mockResolvedValue(null);
    chat.createChatGroup.mockResolvedValue({ _id: 'g-fresh' });
    await restoreDiscussionsWorkspace(workspaceId, 'u9');
    expect((await findDiscussionsWorkspace(workspaceId))?.chatGroupId).toBe('g-fresh');
    expect(chat.createChatGroup.mock.calls[0][0]).toMatch(/^discussions-team-plans-/);
  });

  it('throws NOT_FOUND for an unknown workspace', async () => {
    await expect(restoreDiscussionsWorkspace('nope', 'u1')).rejects.toThrow('not found');
  });
});

describe('addUser and removeUser', () => {
  const setup = async () => {
    await (Users.rawCollection() as any).insertMany([
      { _id: 'with-chat', chatUserId: 'cu1' },
      { _id: 'no-chat' },
    ] as any);
    return (await create()).workspaceId;
  };

  it('adds the chat account of the user to the group', async () => {
    const workspaceId = await setup();
    await discussionsModule.addUser!({ workspaceId } as any, 'with-chat');
    expect(chat.addChatGroupMembers).toHaveBeenCalledWith('g-new', ['cu1']);
  });

  it('does not add a member who is already in the group', async () => {
    const workspaceId = await setup();
    chat.getChatGroupMemberIds.mockResolvedValue(['cu1']);
    await discussionsModule.addUser!({ workspaceId } as any, 'with-chat');
    expect(chat.addChatGroupMembers).not.toHaveBeenCalled();
  });

  it('removes the chat account of the user from the group', async () => {
    const workspaceId = await setup();
    chat.getChatGroupMemberIds.mockResolvedValue(['cu1']);
    await discussionsModule.removeUser!({ workspaceId } as any, 'with-chat');
    expect(chat.removeChatGroupMember).toHaveBeenCalledWith('g-new', 'cu1');
  });

  it('does not remove someone who is not a member', async () => {
    const workspaceId = await setup();
    await discussionsModule.removeUser!({ workspaceId } as any, 'with-chat');
    expect(chat.removeChatGroupMember).not.toHaveBeenCalled();
  });

  it('does nothing for a user without a chat account or an unknown user', async () => {
    const workspaceId = await setup();
    await discussionsModule.addUser!({ workspaceId } as any, 'no-chat');
    await discussionsModule.removeUser!({ workspaceId } as any, 'ghost');
    expect(chat.addChatGroupMembers).not.toHaveBeenCalled();
    expect(chat.removeChatGroupMember).not.toHaveBeenCalled();
  });

  it('throws NOT_FOUND when the workspace is unknown', async () => {
    await setup();
    await expect(
      discussionsModule.addUser!({ workspaceId: 'nope' } as any, 'with-chat')
    ).rejects.toThrow('not found');
  });
});
