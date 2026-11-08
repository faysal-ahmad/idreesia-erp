import { GraphQLError } from 'graphql';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/hr';
import {
  createPollsWorkspace,
  deletePollsWorkspace,
  getPollsWorkspace,
  restorePollsWorkspace,
} from 'meteor/idreesia-common/server/business-logic/polls';

import type { CommitteeDoc, CommitteeFeatureHandler } from './types';

// The committee's polls workspace (deleted ones included), or null when it
// no longer exists, e.g. after being purged.
const findPollsWorkspace = async (workspaceId: string, userId: string) => {
  try {
    return await getPollsWorkspace(workspaceId, userId, {
      includeDeleted: true,
    });
  } catch (error) {
    const code = (error as GraphQLError).extensions?.code;
    if (code === 'NOT_FOUND') return null;
    throw error;
  }
};

/**
 * Polls: a polls workspace holds the committee's polls.
 * - Enable restores the committee's previous workspace when it still
 *   exists (with all its polls), otherwise creates a new one.
 * - Disable soft-deletes the workspace, keeping its polls for a later
 *   re-enable.
 */
export const pollsHandler: CommitteeFeatureHandler = {
  async enable(committee, userId) {
    if (committee.pollsWorkspaceId) {
      const existing = await findPollsWorkspace(
        committee.pollsWorkspaceId,
        userId
      );
      if (existing) {
        if (existing.deletedAt) {
          await restorePollsWorkspace(existing._id, userId);
        }
        return { pollsWorkspaceId: existing._id };
      }
    }

    const workspace = await createPollsWorkspace(
      {
        name: `${committee.name} Polls`,
        metadata: { committeeId: committee._id },
      },
      userId
    );
    return { pollsWorkspaceId: workspace._id };
  },

  async disable(committee, userId) {
    if (!committee.pollsWorkspaceId) return;
    const existing = await findPollsWorkspace(
      committee.pollsWorkspaceId,
      userId
    );
    if (existing && !existing.deletedAt) {
      await deletePollsWorkspace(existing._id, userId);
    }
  },
};

/**
 * The polls workspace behind a committee's polls. Throws when the committee
 * doesn't have Polls enabled.
 */
export const getCommitteePollsWorkspaceId = (
  committee: CommitteeDoc
): string => {
  const enabled = committee.features?.includes(CommitteeFeatureKeys.POLLS);
  if (!enabled || !committee.pollsWorkspaceId) {
    throw new GraphQLError('Polls are not enabled for this committee.', {
      extensions: { code: 'NOT_FOUND' },
    });
  }
  return committee.pollsWorkspaceId;
};
