import { DmsAction, DmsEntityType } from 'meteor/idreesia-common/constants/dms';
import {
  DmsDocuments,
  DmsFolders,
  type DmsDocumentDocument,
  type DmsFolderDocument,
} from 'meteor/idreesia-common/server/collections/dms';

import { logActivity } from './activity';
import { dmsError, isDuplicateKeyError } from './errors';
import {
  documentSort,
  normalizeName,
  normalizePage,
  requireFolder,
  requireUserId,
  requireWorkspace,
  resolveTargetFolder,
  type DmsPage,
  type DmsPageOptions,
  type DmsSortOptions,
} from './internal';

const nameConflict = (name: string) =>
  dmsError('CONFLICT', `A folder named "${name}" already exists here`);

/** ancestorIds for a folder placed in `parent` (null = workspace root). */
export const ancestorIdsUnder = (parent: DmsFolderDocument | null) =>
  parent ? [...parent.ancestorIds, parent._id] : [];

/**
 * After a folder's own ancestorIds changed, rewrites those of every folder
 * below it: everything up to and including the folder is replaced by its new
 * ancestry, the part below it is kept.
 */
export async function rewriteDescendantAncestors(
  folderId: string,
  folderAncestorIds: string[]
) {
  await DmsFolders.rawCollection().updateMany({ ancestorIds: folderId }, [
    {
      $set: {
        ancestorIds: {
          $concatArrays: [
            [...folderAncestorIds, folderId],
            {
              $slice: [
                '$ancestorIds',
                { $add: [{ $indexOfArray: ['$ancestorIds', folderId] }, 1] },
                { $max: [{ $size: '$ancestorIds' }, 1] },
              ],
            },
          ],
        },
      },
    },
  ]);
}

export interface CreateFolderInput {
  workspaceId: string;
  /** Unset or null for the workspace root. */
  parentId?: string | null;
  name: string;
}

export async function createFolder(
  { workspaceId, parentId, name: rawName }: CreateFolderInput,
  userId: string
): Promise<DmsFolderDocument> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);
  const parent = await resolveTargetFolder(workspaceId, parentId);
  const { name, nameLower } = normalizeName(rawName, 'Folder name');

  const date = new Date();
  let folderId: string;
  try {
    folderId = await DmsFolders.insertAsync({
      workspaceId,
      ...(parent ? { parentId: parent._id } : {}),
      ancestorIds: ancestorIdsUnder(parent),
      name,
      nameLower,
      trashed: false,
      createdAt: date,
      createdBy: userId,
      updatedAt: date,
      updatedBy: userId,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) throw nameConflict(name);
    throw error;
  }

  await logActivity({
    workspaceId,
    entityType: DmsEntityType.FOLDER,
    entityId: folderId,
    action: DmsAction.FOLDER_CREATED,
    userId,
    details: { name, parentId: parent?._id ?? null },
  });
  return requireFolder(folderId);
}

export async function getFolder(
  folderId: string,
  userId: string,
  { includeTrashed = false }: { includeTrashed?: boolean } = {}
): Promise<DmsFolderDocument> {
  requireUserId(userId);
  return requireFolder(folderId, { includeTrashed });
}

export async function renameFolder(
  folderId: string,
  newName: string,
  userId: string
): Promise<DmsFolderDocument> {
  requireUserId(userId);
  const folder = await requireFolder(folderId);
  const { name, nameLower } = normalizeName(newName, 'Folder name');
  if (name === folder.name) return folder;

  try {
    await DmsFolders.updateAsync(folderId, {
      $set: { name, nameLower, updatedAt: new Date(), updatedBy: userId },
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) throw nameConflict(name);
    throw error;
  }

  await logActivity({
    workspaceId: folder.workspaceId,
    entityType: DmsEntityType.FOLDER,
    entityId: folderId,
    action: DmsAction.FOLDER_RENAMED,
    userId,
    details: { from: folder.name, to: name },
  });
  return requireFolder(folderId);
}

/** Checks that `folder` may be placed in `target` (not in its own subtree). */
export function assertNotIntoOwnSubtree(
  folder: DmsFolderDocument,
  target: DmsFolderDocument | null
) {
  if (
    target &&
    (target._id === folder._id || target.ancestorIds.includes(folder._id))
  ) {
    throw dmsError(
      'BAD_USER_INPUT',
      'A folder cannot be moved into itself or one of its subfolders'
    );
  }
}

/** Moves a folder (and everything in it) under another one, or to the root. */
export async function moveFolder(
  folderId: string,
  newParentId: string | null,
  userId: string
): Promise<DmsFolderDocument> {
  requireUserId(userId);
  const folder = await requireFolder(folderId);
  const target = await resolveTargetFolder(folder.workspaceId, newParentId);
  if ((target?._id ?? null) === (folder.parentId ?? null)) return folder;
  assertNotIntoOwnSubtree(folder, target);

  const ancestorIds = ancestorIdsUnder(target);
  try {
    await DmsFolders.updateAsync(folderId, {
      $set: {
        ancestorIds,
        updatedAt: new Date(),
        updatedBy: userId,
        ...(target ? { parentId: target._id } : {}),
      },
      ...(target ? {} : { $unset: { parentId: 1 } }),
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) throw nameConflict(folder.name);
    throw error;
  }
  await rewriteDescendantAncestors(folderId, ancestorIds);

  await logActivity({
    workspaceId: folder.workspaceId,
    entityType: DmsEntityType.FOLDER,
    entityId: folderId,
    action: DmsAction.FOLDER_MOVED,
    userId,
    details: { from: folder.parentId ?? null, to: target?._id ?? null },
  });
  return requireFolder(folderId);
}

/** The folders from the workspace root down to (and including) this one. */
export async function getFolderPath(
  folderId: string,
  userId: string
): Promise<DmsFolderDocument[]> {
  requireUserId(userId);
  const folder = await requireFolder(folderId, { includeTrashed: true });
  const ancestors = await DmsFolders.find({
    _id: { $in: folder.ancestorIds },
  }).fetchAsync();
  const byId = new Map(ancestors.map(ancestor => [ancestor._id, ancestor]));
  return [
    ...folder.ancestorIds
      .map(id => byId.get(id))
      .filter((ancestor): ancestor is DmsFolderDocument => !!ancestor),
    folder,
  ];
}

export interface FolderContents {
  folders: DmsFolderDocument[];
  documents: DmsPage<DmsDocumentDocument>;
}

/**
 * A folder's subfolders (all, by name) and a page of its documents. Pass a
 * null folderId for the workspace root.
 */
export async function listFolderContents(
  workspaceId: string,
  folderId: string | null,
  userId: string,
  options: DmsPageOptions & DmsSortOptions = {}
): Promise<FolderContents> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);
  if (folderId) await requireFolder(folderId, { workspaceId });

  const { skip, limit } = normalizePage(options);
  const documentSelector = {
    workspaceId,
    folderId: folderId ?? null,
    trashed: false,
    currentVersionId: { $exists: true },
  };

  const [folders, data, totalResults] = await Promise.all([
    DmsFolders.find(
      { workspaceId, parentId: folderId ?? null, trashed: false },
      { sort: { nameLower: 1, _id: 1 } }
    ).fetchAsync(),
    DmsDocuments.find(documentSelector, {
      sort: documentSort(options),
      skip,
      limit,
    }).fetchAsync(),
    DmsDocuments.find(documentSelector).countAsync(),
  ]);

  return { folders, documents: { data, totalResults } };
}

/** Every live folder of a workspace, by name - e.g. for a folder picker. */
export async function listFolders(
  workspaceId: string,
  userId: string
): Promise<DmsFolderDocument[]> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);
  return DmsFolders.find(
    { workspaceId, trashed: false },
    { sort: { nameLower: 1, _id: 1 } }
  ).fetchAsync();
}
