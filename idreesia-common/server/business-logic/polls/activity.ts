import { isInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  PollsActivities,
  type PollsActivityDocument,
} from 'meteor/idreesia-common/server/collections/polls';

import { normalizePage, requireUserId, requireWorkspace } from './internal';

/**
 * Records a change in the workspace's activity log. Inside a transaction the
 * entry is part of the change, so it is written or rolled back with it.
 * Elsewhere (e.g. logging a download) logging never fails the operation:
 * errors are only reported.
 * Entries never hold a voter's answers.
 */
export async function logActivity(
  entry: Omit<PollsActivityDocument, '_id' | 'at'>
): Promise<void> {
  if (isInTransaction()) {
    await PollsActivities.insertAsync({ ...entry, at: new Date() });
    return;
  }
  try {
    await PollsActivities.insertAsync({ ...entry, at: new Date() });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[polls] Could not log activity', entry, error);
  }
}

export interface ListPollsActivityOptions {
  /** Only activity on this poll (and its votes). */
  pollId?: string;
  /** Only activity on this workspace or poll. */
  entityId?: string;
  /** Only activity before this time, for paging back through the log. */
  before?: Date;
  limit?: number;
}

/** A workspace's activity, newest first. */
export async function listPollsActivity(
  workspaceId: string,
  userId: string,
  { pollId, entityId, before, limit }: ListPollsActivityOptions = {}
): Promise<PollsActivityDocument[]> {
  requireUserId(userId);
  await requireWorkspace(workspaceId, { includeDeleted: true });

  const selector: Record<string, unknown> = { workspaceId };
  if (pollId) selector.pollId = pollId;
  if (entityId) selector.entityId = entityId;
  if (before) selector.at = { $lt: before };

  return PollsActivities.find(selector, {
    sort: { at: -1, _id: -1 },
    limit: normalizePage({ limit }).limit,
  }).fetchAsync();
}
