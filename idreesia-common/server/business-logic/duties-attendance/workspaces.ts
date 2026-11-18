import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  DutiesAttendanceDayOverrides,
  DutiesAttendanceDayRecords,
  DutiesAttendanceDuties,
  DutiesAttendanceWorkspaces,
  DutiesAttendanceWorkspaceUsers,
  type DutiesAttendanceMetadata,
  type DutiesAttendanceWorkspaceDocument,
} from 'meteor/idreesia-common/server/collections/duties-attendance';

import { dutiesAttendanceError } from './errors';
import {
  normalizeName,
  normalizeText,
  requireUserId,
  requireWorkspace,
  stamp,
  validateMetadata,
} from './internal';

export interface CreateDutiesAttendanceWorkspaceInput {
  name: string;
  description?: string;
  metadata?: DutiesAttendanceMetadata;
}

export async function createDutiesAttendanceWorkspace(
  input: CreateDutiesAttendanceWorkspaceInput,
  userId: string
): Promise<DutiesAttendanceWorkspaceDocument> {
  return runInTransaction(async () => {
    requireUserId(userId);
    const name = normalizeName(input.name, 'Workspace name');
    const description = normalizeText(input.description, 'Description');
    const metadata = validateMetadata(input.metadata);

    const workspaceId = await DutiesAttendanceWorkspaces.insertAsync({
      name,
      ...(description ? { description } : {}),
      ...(metadata ? { metadata } : {}),
      ...stamp(userId),
    });
    return requireWorkspace(workspaceId);
  });
}

export async function getDutiesAttendanceWorkspace(
  workspaceId: string,
  { includeDeleted = false }: { includeDeleted?: boolean } = {}
): Promise<DutiesAttendanceWorkspaceDocument> {
  return requireWorkspace(workspaceId, { includeDeleted });
}

/**
 * Soft-deletes a workspace. Its duties, plan, attendance and users stay as
 * they are, so enabling the feature again brings everything back.
 */
export async function deleteDutiesAttendanceWorkspace(
  workspaceId: string,
  userId: string
): Promise<void> {
  return runInTransaction(async () => {
    requireUserId(userId);
    await requireWorkspace(workspaceId);
    await DutiesAttendanceWorkspaces.updateAsync(workspaceId, {
      $set: { deletedAt: new Date(), deletedBy: userId },
    });
  });
}

export async function restoreDutiesAttendanceWorkspace(
  workspaceId: string,
  userId: string
): Promise<DutiesAttendanceWorkspaceDocument> {
  return runInTransaction(async () => {
    requireUserId(userId);
    const workspace = await requireWorkspace(workspaceId, {
      includeDeleted: true,
    });
    if (!workspace.deletedAt) {
      throw dutiesAttendanceError('CONFLICT', 'Workspace is not deleted');
    }
    await DutiesAttendanceWorkspaces.updateAsync(workspaceId, {
      $set: { updatedAt: new Date(), updatedBy: userId },
      $unset: { deletedAt: 1, deletedBy: 1 },
    });
    return requireWorkspace(workspaceId);
  });
}

/**
 * Permanently removes a deleted workspace: its duties, plan, attendance and
 * users.
 */
export async function purgeDutiesAttendanceWorkspace(
  workspaceId: string,
  userId: string
): Promise<void> {
  return runInTransaction(async () => {
    requireUserId(userId);
    const workspace = await requireWorkspace(workspaceId, {
      includeDeleted: true,
    });
    if (!workspace.deletedAt) {
      throw dutiesAttendanceError(
        'CONFLICT',
        'Only a deleted workspace can be purged; delete it first'
      );
    }

    await DutiesAttendanceDayRecords.removeAsync({ workspaceId });
    await DutiesAttendanceDayOverrides.removeAsync({ workspaceId });
    await DutiesAttendanceDuties.removeAsync({ workspaceId });
    await DutiesAttendanceWorkspaceUsers.removeAsync({ workspaceId });
    await DutiesAttendanceWorkspaces.removeAsync(workspaceId);
  });
}
