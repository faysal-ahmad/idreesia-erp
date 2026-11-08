import { GraphQLError } from 'graphql';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/hr';
import {
  createWorkspace,
  deleteWorkspace,
  getWorkspace,
  restoreWorkspace,
} from 'meteor/idreesia-common/server/business-logic/dms';

import type { CommitteeDoc, CommitteeFeatureHandler } from './types';

// The committee's DMS workspace (deleted ones included), or null when it
// no longer exists, e.g. after being purged.
const findDmsWorkspace = async (workspaceId: string, userId: string) => {
  try {
    return await getWorkspace(workspaceId, userId, { includeDeleted: true });
  } catch (error) {
    const code = (error as GraphQLError).extensions?.code;
    if (code === 'NOT_FOUND') return null;
    throw error;
  }
};

/**
 * Documents: a DMS workspace holds the committee's document library.
 * - Enable restores the committee's previous workspace when it still
 *   exists (with all its documents), otherwise creates a new one.
 * - Disable soft-deletes the workspace, keeping its documents for a later
 *   re-enable.
 */
export const documentsHandler: CommitteeFeatureHandler = {
  async enable(committee, userId) {
    if (committee.dmsWorkspaceId) {
      const existing = await findDmsWorkspace(committee.dmsWorkspaceId, userId);
      if (existing) {
        if (existing.deletedAt) await restoreWorkspace(existing._id, userId);
        return { dmsWorkspaceId: existing._id };
      }
    }

    const workspace = await createWorkspace(
      {
        name: `${committee.name} Documents`,
        metadata: { committeeId: committee._id },
      },
      userId
    );
    return { dmsWorkspaceId: workspace._id };
  },

  async disable(committee, userId) {
    if (!committee.dmsWorkspaceId) return;
    const existing = await findDmsWorkspace(committee.dmsWorkspaceId, userId);
    if (existing && !existing.deletedAt) {
      await deleteWorkspace(existing._id, userId);
    }
  },
};

/**
 * The DMS workspace behind a committee's documents. Throws when the
 * committee doesn't have Documents enabled.
 */
export const getCommitteeDmsWorkspaceId = (committee: CommitteeDoc): string => {
  const enabled = committee.features?.includes(CommitteeFeatureKeys.DOCUMENTS);
  if (!enabled || !committee.dmsWorkspaceId) {
    throw new GraphQLError('Documents are not enabled for this committee.', {
      extensions: { code: 'NOT_FOUND' },
    });
  }
  return committee.dmsWorkspaceId;
};
