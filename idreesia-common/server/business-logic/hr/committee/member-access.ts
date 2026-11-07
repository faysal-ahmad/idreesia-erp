import { Users } from 'meteor/idreesia-common/server/collections/admin';

import { getCommitteeDiscussionChatUserIds } from './discussions';
import type { CommitteeDoc } from './types';

export interface CommitteeMemberAccess {
  /** The person has an ERP user. */
  hasLoginAccount: boolean;
  /** That user has a chat account. */
  hasChatAccount: boolean;
  /**
   * That chat account is in the committee's discussion group. Null when
   * Discussions is not enabled, or chat could not be reached.
   */
  hasDiscussionAccess: boolean | null;
}

/** Login/chat/discussion access of each committee member, by karkun id. */
export const getCommitteeMemberAccess = async (
  committee: CommitteeDoc
): Promise<Map<string, CommitteeMemberAccess>> => {
  const personIds = (committee.members ?? []).map(member => member.karkunId);
  const access = new Map<string, CommitteeMemberAccess>();
  if (personIds.length === 0) return access;

  const users = await Users.findByPersonIds(personIds);
  const userByPersonId = new Map(
    users.map(user => [user.personId as string, user])
  );
  // Chat being unreachable shouldn't break member listings; discussion
  // access is just left unknown then.
  const discussionChatUserIds = await getCommitteeDiscussionChatUserIds(
    committee
  ).catch(() => null);

  for (const personId of personIds) {
    const user = userByPersonId.get(personId);
    const chatUserId = user?.chatUserId as string | undefined;
    access.set(personId, {
      hasLoginAccount: !!user,
      hasChatAccount: !!chatUserId,
      hasDiscussionAccess: discussionChatUserIds
        ? !!chatUserId && discussionChatUserIds.has(chatUserId)
        : null,
    });
  }
  return access;
};
