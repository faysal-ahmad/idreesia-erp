import { GraphQLError } from 'graphql';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/hr';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  discussionsModule,
  DISCUSSIONS_MODULE,
  findDiscussionsWorkspace,
  getDiscussionChatGroupId,
  getDiscussionsWorkspaceChatUserIds,
  restoreDiscussionsWorkspace,
} from 'meteor/idreesia-common/server/business-logic/discussions';

import type { CommitteeDoc, CommitteeFeatureHandler } from './types';

// ERP user ids of the committee members. Members are karkuns (people); only
// those with an ERP user can take part.
const memberUserIds = async (committee: CommitteeDoc) => {
  const personIds = (committee.members ?? []).map(member => member.karkunId);
  if (personIds.length === 0) return [];
  const users = await Users.findByPersonIds(personIds);
  return users.map(user => user._id as string);
};

// The ERP user of one person, if they have one.
const personUserId = async (personId: string) => {
  const [user] = await Users.findByPersonIds([personId]);
  return (user?._id as string | undefined) || null;
};

const workspaceRef = (workspaceId: string) => ({
  module: DISCUSSIONS_MODULE,
  workspaceId,
});

/**
 * Discussions: the committee members talk in a discussions workspace.
 * - Enable restores the committee's previous workspace when it still exists
 *   (unarchiving its chat group), otherwise creates a new one. Either way
 *   the current members are added.
 * - Disable archives the workspace, keeping its history for a later
 *   re-enable.
 */
export const discussionsHandler: CommitteeFeatureHandler = {
  async enable(committee, userId) {
    let workspaceId: string | undefined;
    if (committee.discussionsWorkspaceId) {
      const existing = await findDiscussionsWorkspace(
        committee.discussionsWorkspaceId
      );
      if (existing) {
        if (existing.deletedAt) {
          await restoreDiscussionsWorkspace(existing._id, userId);
        }
        workspaceId = existing._id;
      }
    }
    if (!workspaceId) {
      workspaceId = (
        await discussionsModule.createWorkspace({
          name: committee.name,
          createdBy: userId,
          metadata: { committeeId: committee._id },
        })
      ).workspaceId;
    }

    for (const memberUserId of await memberUserIds(committee)) {
      await discussionsModule.addUser(workspaceRef(workspaceId), memberUserId);
    }
    return { discussionsWorkspaceId: workspaceId };
  },

  async disable(committee, userId) {
    if (!committee.discussionsWorkspaceId) return;
    const existing = await findDiscussionsWorkspace(
      committee.discussionsWorkspaceId
    );
    if (existing && !existing.deletedAt) {
      await discussionsModule.archiveWorkspace(workspaceRef(existing._id), userId);
    }
  },

  // Keep the workspace's membership in step with the committee's.
  async memberAdded(committee, karkunId) {
    if (!committee.discussionsWorkspaceId) return;
    const userId = await personUserId(karkunId);
    if (userId) {
      await discussionsModule.addUser(
        workspaceRef(committee.discussionsWorkspaceId),
        userId
      );
    }
  },

  async memberRemoved(committee, karkunId) {
    if (!committee.discussionsWorkspaceId) return;
    const userId = await personUserId(karkunId);
    if (userId) {
      await discussionsModule.removeUser(
        workspaceRef(committee.discussionsWorkspaceId),
        userId
      );
    }
  },
};

const isDiscussionsEnabled = (committee: CommitteeDoc) =>
  !!committee.discussionsWorkspaceId &&
  !!committee.features?.includes(CommitteeFeatureKeys.DISCUSSIONS);

/**
 * Chat user ids currently in the committee's discussion, or null when the
 * committee doesn't have Discussions enabled.
 */
export const getCommitteeDiscussionChatUserIds = async (
  committee: CommitteeDoc
): Promise<Set<string> | null> => {
  if (!isDiscussionsEnabled(committee)) return null;
  return getDiscussionsWorkspaceChatUserIds(committee.discussionsWorkspaceId!);
};

/**
 * Gives a committee member access to the committee's discussion or takes it
 * away.
 */
export const setCommitteeMemberDiscussionAccess = async (
  committee: CommitteeDoc,
  karkunId: string,
  hasAccess: boolean
): Promise<true> => {
  if (!isDiscussionsEnabled(committee)) {
    throw new GraphQLError('Discussions are not enabled for this committee.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  if (!(committee.members ?? []).some(member => member.karkunId === karkunId)) {
    throw new GraphQLError('This person is not a member of the committee.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  const [user] = await Users.findByPersonIds([karkunId]);
  if (!user?.chatUserId) {
    throw new GraphQLError('This member does not have a chat account.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const workspace = workspaceRef(committee.discussionsWorkspaceId!);
  if (hasAccess) {
    await discussionsModule.addUser(workspace, user._id as string);
  } else {
    await discussionsModule.removeUser(workspace, user._id as string);
  }
  return true;
};

/**
 * The discussions workspace behind a committee's discussions. Throws when
 * the committee doesn't have Discussions enabled.
 */
export const getCommitteeDiscussionsWorkspaceId = (
  committee: CommitteeDoc
): string => {
  if (!isDiscussionsEnabled(committee)) {
    throw new GraphQLError('Discussions are not enabled for this committee.', {
      extensions: { code: 'NOT_FOUND' },
    });
  }
  return committee.discussionsWorkspaceId!;
};

/**
 * The chat group behind a committee's discussions: resolved from the
 * workspace, for the message functions that work on a chat group. Never
 * leaves the server.
 */
export const getCommitteeChatGroupId = async (
  committee: CommitteeDoc
): Promise<string> =>
  getDiscussionChatGroupId(getCommitteeDiscussionsWorkspaceId(committee));
