import {
  DmsActivities,
  type DmsActivityDocument,
} from 'meteor/idreesia-common/server/collections/dms';

import { normalizePage, requireUserId, requireWorkspace } from './internal';

/**
 * Records a change in the workspace's activity log. Logging never fails the
 * change it records: errors are only reported.
 */
export async function logActivity(
  entry: Omit<DmsActivityDocument, '_id' | 'at'>
): Promise<void> {
  try {
    await DmsActivities.insertAsync({ ...entry, at: new Date() });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[dms] Could not log activity', entry, error);
  }
}

export interface ListActivityOptions {
  /** Only activity on this document (including its versions). */
  documentId?: string;
  /** Only activity on this workspace, folder, document or version. */
  entityId?: string;
  /** Only activity before this time, for paging back through the log. */
  before?: Date;
  limit?: number;
}

/** A workspace's activity, newest first. */
export async function listActivity(
  workspaceId: string,
  userId: string,
  { documentId, entityId, before, limit }: ListActivityOptions = {}
): Promise<DmsActivityDocument[]> {
  requireUserId(userId);
  await requireWorkspace(workspaceId, { includeDeleted: true });

  const selector: Record<string, unknown> = { workspaceId };
  if (documentId) selector.documentId = documentId;
  if (entityId) selector.entityId = entityId;
  if (before) selector.at = { $lt: before };

  return DmsActivities.find(selector, {
    sort: { at: -1, _id: -1 },
    limit: normalizePage({ limit }).limit,
  }).fetchAsync();
}
