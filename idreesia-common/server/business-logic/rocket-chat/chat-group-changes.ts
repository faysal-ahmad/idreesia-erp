import { onRollback } from 'meteor/idreesia-common/server/collections';
import {
  addChatGroupMembers,
  archiveChatGroup,
  createChatGroup,
  getChatGroupMemberIds,
  removeChatGroupMember,
  unarchiveChatGroup,
  type ChatGroup,
} from 'meteor/idreesia-common/server/chat';

/*
 * Chat group changes made as part of a database transaction. Each change is
 * made straight away, so a chat failure still fails the operation, and is
 * undone if the transaction then rolls back, so the chat never keeps a group
 * or membership the ERP has no record of. Outside a transaction they behave
 * like the plain chat calls.
 */

/** Creates a private group; it is archived again on rollback. */
export async function createChatGroupWithRollback(
  name: string
): Promise<ChatGroup> {
  const group = await createChatGroup(name);
  await onRollback(() => archiveChatGroup(group._id));
  return group;
}

export async function archiveChatGroupWithRollback(roomId: string) {
  await archiveChatGroup(roomId);
  await onRollback(() => unarchiveChatGroup(roomId));
}

export async function unarchiveChatGroupWithRollback(roomId: string) {
  await unarchiveChatGroup(roomId);
  await onRollback(() => archiveChatGroup(roomId));
}

/**
 * Adds chat users to a private group. Only the users who were not already
 * members are removed again on rollback.
 */
export async function addChatGroupMembersWithRollback(
  roomId: string,
  chatUserIds: string[]
) {
  if (!chatUserIds.length) return;
  const existing = new Set(await getChatGroupMemberIds(roomId));
  const added = [...new Set(chatUserIds)].filter(id => !existing.has(id));
  if (!added.length) return;
  await onRollback(async () => {
    for (const chatUserId of added) {
      await removeChatGroupMember(roomId, chatUserId);
    }
  });
  await addChatGroupMembers(roomId, added);
}

/** Removes a chat user from a private group; added back on rollback. */
export async function removeChatGroupMemberWithRollback(
  roomId: string,
  chatUserId: string
) {
  const existing = await getChatGroupMemberIds(roomId);
  if (!existing.includes(chatUserId)) return;
  await removeChatGroupMember(roomId, chatUserId);
  await onRollback(() => addChatGroupMembers(roomId, [chatUserId]));
}
