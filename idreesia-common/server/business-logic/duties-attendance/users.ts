import {
  DutiesAttendancePermissions,
  DutiesAttendancePermissionValues,
  type DutiesAttendancePermission,
} from 'meteor/idreesia-common/constants/duties-attendance';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import {
  DutiesAttendanceWorkspaceUsers,
  type DutiesAttendanceWorkspaceUserDocument,
} from 'meteor/idreesia-common/server/collections/duties-attendance';

import { dutiesAttendanceError } from './errors';
import {
  ensureDutiesAttendanceIndexes,
  isDuplicateKey,
  requireUserId,
  requireWorkspace,
  stamp,
  touch,
} from './internal';

/**
 * Checks a permission list: every value must be known, at least one is
 * needed, and anything other than VIEW brings VIEW with it.
 */
export function normalizePermissions(
  permissions: unknown
): DutiesAttendancePermission[] {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      'At least one permission is required'
    );
  }
  const unknown = permissions.find(
    permission =>
      !DutiesAttendancePermissionValues.includes(
        permission as DutiesAttendancePermission
      )
  );
  if (unknown !== undefined) {
    throw dutiesAttendanceError(
      'BAD_USER_INPUT',
      `Unknown permission "${String(unknown)}"`
    );
  }
  const set = new Set(permissions as DutiesAttendancePermission[]);
  set.add(DutiesAttendancePermissions.VIEW);
  // Keep the canonical order so stored lists compare equal.
  return DutiesAttendancePermissionValues.filter(permission =>
    set.has(permission)
  );
}

async function requireUser(userId: string) {
  const user = userId ? await Users.findOneAsync(userId) : undefined;
  if (!user) {
    throw dutiesAttendanceError('NOT_FOUND', 'User not found');
  }
  return user;
}

export async function addDutiesAttendanceWorkspaceUser(
  workspaceId: string,
  input: { userId: string; permissions: string[] },
  actorId: string
): Promise<DutiesAttendanceWorkspaceUserDocument> {
  // Indexes are created outside the transaction, which can't create them.
  await ensureDutiesAttendanceIndexes();
  return runInTransaction(async () => {
    requireUserId(actorId);
    await requireWorkspace(workspaceId);
    const permissions = normalizePermissions(input.permissions);
    await requireUser(input.userId);

    const existing = await DutiesAttendanceWorkspaceUsers.findOneAsync({
      workspaceId,
      userId: input.userId,
    });
    if (existing) {
      throw dutiesAttendanceError(
        'CONFLICT',
        'This user is already a user of the workspace'
      );
    }

    // The unique index catches a concurrent add.
    try {
      const _id = await DutiesAttendanceWorkspaceUsers.insertAsync({
        workspaceId,
        userId: input.userId,
        permissions,
        ...stamp(actorId),
      });
      return (await DutiesAttendanceWorkspaceUsers.findOneAsync(
        _id
      ))!;
    } catch (error) {
      if (isDuplicateKey(error)) {
        throw dutiesAttendanceError(
          'CONFLICT',
          'This user is already a user of the workspace'
        );
      }
      throw error;
    }
  });
}

export async function updateDutiesAttendanceWorkspaceUserPermissions(
  workspaceId: string,
  userId: string,
  permissions: string[],
  actorId: string
): Promise<DutiesAttendanceWorkspaceUserDocument> {
  return runInTransaction(async () => {
    requireUserId(actorId);
    await requireWorkspace(workspaceId);
    const normalized = normalizePermissions(permissions);

    const updated = await DutiesAttendanceWorkspaceUsers.updateAsync(
      { workspaceId, userId },
      { $set: { permissions: normalized, ...touch(actorId) } }
    );
    if (!updated) {
      throw dutiesAttendanceError(
        'NOT_FOUND',
        'This user is not a user of the workspace'
      );
    }
    return (await DutiesAttendanceWorkspaceUsers.findOneAsync({
      workspaceId,
      userId,
    }))!;
  });
}

export async function removeDutiesAttendanceWorkspaceUser(
  workspaceId: string,
  userId: string,
  actorId: string
): Promise<void> {
  return runInTransaction(async () => {
    requireUserId(actorId);
    await requireWorkspace(workspaceId);
    const removed = await DutiesAttendanceWorkspaceUsers.removeAsync({
      workspaceId,
      userId,
    });
    if (!removed) {
      throw dutiesAttendanceError(
        'NOT_FOUND',
        'This user is not a user of the workspace'
      );
    }
  });
}

export interface WorkspaceUserCandidate {
  _id: string;
  username?: string;
  displayName?: string;
}

const CANDIDATE_LIMIT = 20;

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Unlocked users linked to a person (workspaces are only open to them) whose
 * username or display name contains the text, for choosing who to add to a
 * workspace.
 */
export async function searchWorkspaceUserCandidates(
  search: string | null | undefined
): Promise<WorkspaceUserCandidate[]> {
  const text = (search ?? '').trim();
  const selector: Record<string, unknown> = {
    locked: { $ne: true },
    personId: { $exists: true, $nin: [null, ''] },
  };
  if (text) {
    const regex = { $regex: escapeRegExp(text), $options: 'i' };
    selector.$or = [{ username: regex }, { displayName: regex }];
  }
  const users = await Users.find(selector, {
    sort: { displayName: 1, username: 1 },
    limit: CANDIDATE_LIMIT,
  }).fetchAsync();
  return users.map(user => ({
    _id: user._id as string,
    username: user.username,
    displayName: user.displayName,
  }));
}
