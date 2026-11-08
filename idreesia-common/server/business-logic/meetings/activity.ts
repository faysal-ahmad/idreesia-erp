import {
  MeetingsActivities,
  type MeetingsActivityDocument,
} from 'meteor/idreesia-common/server/collections/meetings';

import { normalizePage, requireUserId, requireWorkspace } from './internal';

/**
 * Records a change in the workspace's activity log. Logging never fails the
 * change it records: errors are only reported.
 */
export async function logActivity(
  entry: Omit<MeetingsActivityDocument, '_id' | 'at'>
): Promise<void> {
  try {
    await MeetingsActivities.insertAsync({ ...entry, at: new Date() });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[meetings] Could not log activity', entry, error);
  }
}

export interface ListMeetingsActivityOptions {
  /** Only activity on this meeting (and its participants, agenda, etc.). */
  meetingId?: string;
  /** Only activity on this workspace, meeting, agenda item, attachment... */
  entityId?: string;
  /** Only activity before this time, for paging back through the log. */
  before?: Date;
  limit?: number;
}

/** A workspace's activity, newest first. */
export async function listMeetingsActivity(
  workspaceId: string,
  userId: string,
  { meetingId, entityId, before, limit }: ListMeetingsActivityOptions = {}
): Promise<MeetingsActivityDocument[]> {
  requireUserId(userId);
  await requireWorkspace(workspaceId, { includeDeleted: true });

  const selector: Record<string, unknown> = { workspaceId };
  if (meetingId) selector.meetingId = meetingId;
  if (entityId) selector.entityId = entityId;
  if (before) selector.at = { $lt: before };

  return MeetingsActivities.find(selector, {
    sort: { at: -1, _id: -1 },
    limit: normalizePage({ limit }).limit,
  }).fetchAsync();
}
