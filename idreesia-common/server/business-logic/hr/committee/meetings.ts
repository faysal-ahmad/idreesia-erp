import { GraphQLError } from 'graphql';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/organization';
import {
  createMeetingsWorkspace,
  deleteMeetingsWorkspace,
  getMeetingsWorkspace,
  restoreMeetingsWorkspace,
} from 'meteor/idreesia-common/server/business-logic/meetings';

import type { CommitteeDoc, CommitteeFeatureHandler } from './types';

// The committee's meetings workspace (deleted ones included), or null when
// it no longer exists, e.g. after being purged.
const findMeetingsWorkspace = async (workspaceId: string, userId: string) => {
  try {
    return await getMeetingsWorkspace(workspaceId, userId, {
      includeDeleted: true,
    });
  } catch (error) {
    const code = (error as GraphQLError).extensions?.code;
    if (code === 'NOT_FOUND') return null;
    throw error;
  }
};

/**
 * Meetings: a meetings workspace holds the committee's meetings.
 * - Enable restores the committee's previous workspace when it still
 *   exists (with all its meetings), otherwise creates a new one.
 * - Disable soft-deletes the workspace, keeping its meetings for a later
 *   re-enable.
 */
export const meetingsHandler: CommitteeFeatureHandler = {
  async enable(committee, userId) {
    if (committee.meetingsWorkspaceId) {
      const existing = await findMeetingsWorkspace(
        committee.meetingsWorkspaceId,
        userId
      );
      if (existing) {
        if (existing.deletedAt) {
          await restoreMeetingsWorkspace(existing._id, userId);
        }
        return { meetingsWorkspaceId: existing._id };
      }
    }

    const workspace = await createMeetingsWorkspace(
      {
        name: `${committee.name} Meetings`,
        metadata: { committeeId: committee._id },
      },
      userId
    );
    return { meetingsWorkspaceId: workspace._id };
  },

  async disable(committee, userId) {
    if (!committee.meetingsWorkspaceId) return;
    const existing = await findMeetingsWorkspace(
      committee.meetingsWorkspaceId,
      userId
    );
    if (existing && !existing.deletedAt) {
      await deleteMeetingsWorkspace(existing._id, userId);
    }
  },
};

/**
 * The meetings workspace behind a committee's meetings. Throws when the
 * committee doesn't have Meetings enabled.
 */
export const getCommitteeMeetingsWorkspaceId = (
  committee: CommitteeDoc
): string => {
  const enabled = committee.features?.includes(CommitteeFeatureKeys.MEETINGS);
  if (!enabled || !committee.meetingsWorkspaceId) {
    throw new GraphQLError('Meetings are not enabled for this committee.', {
      extensions: { code: 'NOT_FOUND' },
    });
  }
  return committee.meetingsWorkspaceId;
};
