import { randomBytes } from 'crypto';
import { GraphQLError } from 'graphql';

import {
  addChatGroupMembers,
  archiveChatGroup,
  createChatGroup,
  findChatGroup,
  getChatGroupMemberIds,
  removeChatGroupMember,
  unarchiveChatGroup,
} from 'meteor/idreesia-common/server/chat';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  DiscussionsWorkspaces,
  type DiscussionsWorkspaceDocument,
} from 'meteor/idreesia-common/server/collections/discussions';
import type {
  HeadlessModule,
  WorkspaceRef,
} from 'meteor/idreesia-common/server/headless';

export const DISCUSSIONS_MODULE = 'discussions';

const notFound = () =>
  new GraphQLError('Discussions workspace not found.', {
    extensions: { code: 'NOT_FOUND' },
  });

const toRef = (workspaceId: string): WorkspaceRef => ({
  module: DISCUSSIONS_MODULE,
  workspaceId,
});

// Rocket.Chat room names only allow letters, digits, '-', '_' and '.', and
// must be unique; the random suffix keeps similarly named workspaces apart.
const chatGroupName = (name: string) => {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `discussions-${slug || 'group'}-${randomBytes(3).toString('hex')}`;
};

const requireWorkspace = async (
  workspaceId: string,
  { includeDeleted = false }: { includeDeleted?: boolean } = {}
): Promise<DiscussionsWorkspaceDocument> => {
  const workspace = (await DiscussionsWorkspaces.findOneAsync(
    workspaceId
  )) as DiscussionsWorkspaceDocument | undefined;
  if (!workspace || (!includeDeleted && workspace.deletedAt)) throw notFound();
  return workspace;
};

/**
 * The chat group behind a workspace. Internal to the discussions module: the
 * rest of the ERP only ever holds the workspace id.
 */
export const getDiscussionChatGroupId = async (
  workspaceId: string
): Promise<string> => (await requireWorkspace(workspaceId)).chatGroupId;

/** Whether the workspace exists (deleted ones included). */
export const findDiscussionsWorkspace = async (
  workspaceId: string
): Promise<DiscussionsWorkspaceDocument | null> =>
  ((await DiscussionsWorkspaces.findOneAsync(workspaceId)) as
    | DiscussionsWorkspaceDocument
    | undefined) ?? null;

/**
 * Brings a soft-deleted workspace back, unarchiving its chat group (or
 * creating a new one if it no longer exists).
 */
export const restoreDiscussionsWorkspace = async (
  workspaceId: string,
  userId: string
): Promise<WorkspaceRef> => {
  const workspace = await requireWorkspace(workspaceId, {
    includeDeleted: true,
  });
  const group = await findChatGroup(workspace.chatGroupId);
  let chatGroupId = workspace.chatGroupId;
  if (!group) {
    chatGroupId = (await createChatGroup(chatGroupName(workspace.name)))._id;
  } else if (group.archived) {
    await unarchiveChatGroup(group._id);
  }

  await DiscussionsWorkspaces.updateAsync(workspaceId, {
    $set: { chatGroupId, updatedAt: new Date(), updatedBy: userId },
    $unset: { deletedAt: 1, deletedBy: 1 },
  });
  return toRef(workspaceId);
};

const chatUserIdOf = async (userId: string): Promise<string | null> => {
  const user = (await Users.findOneAsync(userId, {
    fields: { chatUserId: 1 },
  })) as { chatUserId?: string } | undefined;
  return user?.chatUserId || null;
};

/** Chat user ids currently in the workspace's chat group. */
export const getDiscussionsWorkspaceChatUserIds = async (
  workspaceId: string
): Promise<Set<string>> =>
  new Set(await getChatGroupMemberIds(await getDiscussionChatGroupId(workspaceId)));

export const discussionsModule: HeadlessModule = {
  name: DISCUSSIONS_MODULE,

  async createWorkspace({ name, createdBy, metadata }) {
    const group = await createChatGroup(chatGroupName(name));
    const date = new Date();
    const workspaceId = await DiscussionsWorkspaces.insertAsync({
      name,
      chatGroupId: group._id,
      ...(metadata ? { metadata } : {}),
      createdAt: date,
      createdBy,
      updatedAt: date,
      updatedBy: createdBy,
    });
    return toRef(workspaceId);
  },

  // Archives the chat group (keeping its history) and soft-deletes the
  // workspace; restoreDiscussionsWorkspace brings both back.
  async archiveWorkspace({ workspaceId }, userId) {
    const workspace = await requireWorkspace(workspaceId, {
      includeDeleted: true,
    });
    if (workspace.deletedAt) return;
    const group = await findChatGroup(workspace.chatGroupId);
    if (group && !group.archived) await archiveChatGroup(group._id);
    await DiscussionsWorkspaces.updateAsync(workspaceId, {
      $set: { deletedAt: new Date(), deletedBy: userId },
    });
  },

  // Users without a chat account have nothing to add or remove.
  async addUser({ workspaceId }, userId) {
    const chatUserId = await chatUserIdOf(userId);
    if (!chatUserId) return;
    await addChatGroupMembers(await getDiscussionChatGroupId(workspaceId), [
      chatUserId,
    ]);
  },

  async removeUser({ workspaceId }, userId) {
    const chatUserId = await chatUserIdOf(userId);
    if (!chatUserId) return;
    await removeChatGroupMember(
      await getDiscussionChatGroupId(workspaceId),
      chatUserId
    );
  },
};
