import { DmsAction, DmsEntityType } from 'meteor/idreesia-common/constants/dms';
import {
  DmsDocuments,
  DmsDocumentVersions,
  DmsFolders,
  type DmsDocumentDocument,
  type DmsFolderDocument,
} from 'meteor/idreesia-common/server/collections/dms';

import { logActivity } from './activity';
import { documentNameConflict } from './documents';
import { dmsError, isDuplicateKeyError } from './errors';
import {
  ancestorIdsUnder,
  assertNotIntoOwnSubtree,
  rewriteDescendantAncestors,
} from './folders';
import {
  deleteFilesQuietly,
  getSubtreeFolderIds,
  guardedDocumentUpdate,
  isLockedByOther,
  lockedByOtherSelector,
  lockedError,
  lockFreeSelector,
  normalizeName,
  requireDocument,
  requireFolder,
  requireUserId,
  requireWorkspace,
} from './internal';

/** Moves a document to the trash. */
export async function trashDocument(
  documentId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const document = await requireDocument(documentId);
  const date = new Date();
  await guardedDocumentUpdate(documentId, userId, {
    $set: {
      trashed: true,
      trashRootId: documentId,
      deletedAt: date,
      deletedBy: userId,
    },
  });
  await logActivity({
    workspaceId: document.workspaceId,
    entityType: DmsEntityType.DOCUMENT,
    entityId: documentId,
    documentId,
    action: DmsAction.DOCUMENT_TRASHED,
    userId,
  });
}

/**
 * Moves a folder, its subfolders and their documents to the trash, as one
 * item. Refused while another user has any of those documents checked out.
 */
export async function trashFolder(
  folderId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const folder = await requireFolder(folderId);
  const folderIds = await getSubtreeFolderIds(folderId);

  const date = new Date();
  const locked = await DmsDocuments.findOneAsync({
    folderId: { $in: folderIds },
    trashed: false,
    ...lockedByOtherSelector(userId, date),
  });
  if (locked) throw lockedError(locked);

  const trashFields = {
    trashed: true,
    trashRootId: folderId,
    deletedAt: date,
    deletedBy: userId,
  };
  await DmsFolders.updateAsync(
    { _id: { $in: folderIds }, trashed: false },
    { $set: trashFields },
    { multi: true }
  );
  await DmsDocuments.updateAsync(
    { folderId: { $in: folderIds }, trashed: false },
    { $set: trashFields },
    { multi: true }
  );

  await logActivity({
    workspaceId: folder.workspaceId,
    entityType: DmsEntityType.FOLDER,
    entityId: folderId,
    action: DmsAction.FOLDER_TRASHED,
    userId,
    details: { name: folder.name },
  });
}

/** Items that were trashed themselves (not along with a folder). */
const trashRootSelector = (workspaceId: string) => ({
  workspaceId,
  trashed: true,
  $expr: { $eq: ['$trashRootId', '$_id'] },
});

export interface TrashContents {
  folders: DmsFolderDocument[];
  documents: DmsDocumentDocument[];
}

/** The workspace's trash, most recently trashed first. */
export async function listTrash(
  workspaceId: string,
  userId: string
): Promise<TrashContents> {
  requireUserId(userId);
  await requireWorkspace(workspaceId);
  const sort = { deletedAt: -1 as const, _id: 1 as const };
  const [folders, documents] = await Promise.all([
    DmsFolders.find(trashRootSelector(workspaceId), { sort }).fetchAsync(),
    DmsDocuments.find(trashRootSelector(workspaceId), { sort }).fetchAsync(),
  ]);
  return { folders, documents };
}

type TrashItem =
  | { kind: 'folder'; item: DmsFolderDocument }
  | { kind: 'document'; item: DmsDocumentDocument };

/** A folder or document that was itself put in the trash. */
async function requireTrashItem(itemId: string): Promise<TrashItem> {
  const folder = itemId ? await DmsFolders.findOneAsync(itemId) : undefined;
  const document =
    itemId && !folder ? await DmsDocuments.findOneAsync(itemId) : undefined;
  const item = folder ?? document;
  if (!item || !item.trashed) {
    throw dmsError('NOT_FOUND', 'Item not found in the trash');
  }
  if (item.trashRootId !== item._id) {
    throw dmsError(
      'CONFLICT',
      'This item was trashed along with a folder; restore or purge that folder instead',
      { trashRootId: item.trashRootId }
    );
  }
  await requireWorkspace(item.workspaceId);
  return folder
    ? { kind: 'folder', item: folder }
    : { kind: 'document', item: document! };
}

/**
 * The folder a restored item goes back into: the requested one, else its
 * original folder if that is still live.
 */
async function resolveRestoreTarget(
  workspaceId: string,
  originalFolderId: string | undefined,
  targetFolderId: string | null | undefined
): Promise<DmsFolderDocument | null> {
  if (targetFolderId !== undefined) {
    return targetFolderId
      ? requireFolder(targetFolderId, { workspaceId })
      : null;
  }
  if (!originalFolderId) return null;
  const original = await DmsFolders.findOneAsync(originalFolderId);
  if (!original || original.trashed) {
    throw dmsError(
      'CONFLICT',
      'The folder this item was in is no longer available; restore it into another folder'
    );
  }
  return original;
}

export interface RestoreOptions {
  /** Restore under a new name, e.g. when the old one is taken. */
  newName?: string;
  /** Restore into this folder (null = root) instead of the original one. */
  targetFolderId?: string | null;
}

const restoredFields = (userId: string) => ({
  trashed: false,
  updatedAt: new Date(),
  updatedBy: userId,
});
const UNSET_TRASH_FIELDS = {
  trashRootId: 1 as const,
  deletedAt: 1 as const,
  deletedBy: 1 as const,
};

/**
 * Restores a trashed folder (with everything trashed along with it) or
 * document. Fails with CONFLICT if its name is taken in the target folder;
 * pass newName to restore it under another one.
 */
export async function restoreFromTrash(
  itemId: string,
  userId: string,
  { newName, targetFolderId }: RestoreOptions = {}
): Promise<void> {
  requireUserId(userId);
  const trashItem = await requireTrashItem(itemId);
  const names =
    newName !== undefined ? normalizeName(newName, 'Name') : undefined;

  if (trashItem.kind === 'document') {
    const document = trashItem.item;
    const target = await resolveRestoreTarget(
      document.workspaceId,
      document.folderId,
      targetFolderId
    );
    const name = names?.name ?? document.name;
    let restored: number;
    try {
      restored = await DmsDocuments.updateAsync(
        {
          _id: document._id,
          trashed: true,
          trashRootId: document._id,
          ...lockFreeSelector(userId),
        },
        {
          $set: {
            ...restoredFields(userId),
            ...(names ?? {}),
            ...(target ? { folderId: target._id } : {}),
          },
          $unset: {
            ...UNSET_TRASH_FIELDS,
            ...(target ? {} : { folderId: 1 as const }),
          },
        }
      );
    } catch (error) {
      if (isDuplicateKeyError(error)) throw documentNameConflict(name);
      throw error;
    }
    if (!restored) {
      if (isLockedByOther(document, userId)) throw lockedError(document);
      throw dmsError('CONFLICT', 'The item was changed by another request');
    }

    await logActivity({
      workspaceId: document.workspaceId,
      entityType: DmsEntityType.DOCUMENT,
      entityId: document._id,
      documentId: document._id,
      action: DmsAction.DOCUMENT_RESTORED,
      userId,
      details: { folderId: target?._id ?? null, name },
    });
    return;
  }

  const folder = trashItem.item;
  const target = await resolveRestoreTarget(
    folder.workspaceId,
    folder.parentId,
    targetFolderId
  );
  assertNotIntoOwnSubtree(folder, target);
  const ancestorIds = ancestorIdsUnder(target);
  const name = names?.name ?? folder.name;
  try {
    await DmsFolders.updateAsync(
      { _id: folder._id, trashed: true, trashRootId: folder._id },
      {
        $set: {
          ...restoredFields(userId),
          ...(names ?? {}),
          ancestorIds,
          ...(target ? { parentId: target._id } : {}),
        },
        $unset: {
          ...UNSET_TRASH_FIELDS,
          ...(target ? {} : { parentId: 1 as const }),
        },
      }
    );
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw dmsError(
        'CONFLICT',
        `A folder named "${name}" already exists here`
      );
    }
    throw error;
  }
  if ((target?._id ?? null) !== (folder.parentId ?? null)) {
    await rewriteDescendantAncestors(folder._id, ancestorIds);
  }

  const restoreDescendants = {
    $set: restoredFields(userId),
    $unset: UNSET_TRASH_FIELDS,
  };
  await DmsFolders.updateAsync(
    { trashRootId: folder._id, trashed: true },
    restoreDescendants,
    { multi: true }
  );
  await DmsDocuments.updateAsync(
    { trashRootId: folder._id, trashed: true },
    restoreDescendants,
    { multi: true }
  );

  await logActivity({
    workspaceId: folder.workspaceId,
    entityType: DmsEntityType.FOLDER,
    entityId: folder._id,
    action: DmsAction.FOLDER_RESTORED,
    userId,
    details: { parentId: target?._id ?? null, name },
  });
}

/** Removes documents, their versions and stored files permanently. */
async function purgeDocuments(documentIds: string[]) {
  if (!documentIds.length) return;
  const versions = await DmsDocumentVersions.find(
    { documentId: { $in: documentIds } },
    { fields: { fileKey: 1 } }
  ).fetchAsync();
  await DmsDocumentVersions.removeAsync({ documentId: { $in: documentIds } });
  await DmsDocuments.removeAsync({ _id: { $in: documentIds } });
  await deleteFilesQuietly(versions.map(({ fileKey }) => fileKey));
}

/**
 * Permanently deletes a trashed item. For a folder this includes everything
 * below it - also items that were trashed on their own before it. Refused
 * while another user has any affected document checked out.
 */
export async function purgeFromTrash(
  itemId: string,
  userId: string
): Promise<void> {
  requireUserId(userId);
  const trashItem = await requireTrashItem(itemId);

  if (trashItem.kind === 'document') {
    const document = trashItem.item;
    if (isLockedByOther(document, userId)) throw lockedError(document);
    await purgeDocuments([document._id]);
    await logActivity({
      workspaceId: document.workspaceId,
      entityType: DmsEntityType.DOCUMENT,
      entityId: document._id,
      documentId: document._id,
      action: DmsAction.DOCUMENT_PURGED,
      userId,
      details: { name: document.name },
    });
    return;
  }

  const folder = trashItem.item;
  const folderIds = await getSubtreeFolderIds(folder._id);
  const documents = await DmsDocuments.find(
    { folderId: { $in: folderIds } },
    { fields: { _id: 1, name: 1, lock: 1 } }
  ).fetchAsync();
  const locked = documents.find(document =>
    isLockedByOther(document as DmsDocumentDocument, userId)
  );
  if (locked) throw lockedError(locked as DmsDocumentDocument);

  await purgeDocuments(documents.map(({ _id }) => _id));
  await DmsFolders.removeAsync({ _id: { $in: folderIds } });

  await logActivity({
    workspaceId: folder.workspaceId,
    entityType: DmsEntityType.FOLDER,
    entityId: folder._id,
    action: DmsAction.FOLDER_PURGED,
    userId,
    details: {
      name: folder.name,
      folders: folderIds.length,
      documents: documents.length,
    },
  });
}

export interface EmptyTrashResult {
  purged: number;
  /** Items left in the trash, e.g. because a document is checked out. */
  skipped: { itemId: string; reason: string }[];
}

/** Purges everything in the trash, or only items trashed long enough ago. */
export async function emptyTrash(
  workspaceId: string,
  userId: string,
  { olderThanDays }: { olderThanDays?: number } = {}
): Promise<EmptyTrashResult> {
  requireUserId(userId);
  const { folders, documents } = await listTrash(workspaceId, userId);
  const cutoff =
    olderThanDays !== undefined
      ? new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
      : undefined;

  const result: EmptyTrashResult = { purged: 0, skipped: [] };
  // Folders first: purging one also removes items trashed inside it.
  for (const item of [...folders, ...documents]) {
    if (cutoff && item.deletedAt && item.deletedAt > cutoff) continue;
    try {
      await purgeFromTrash(item._id, userId);
      result.purged += 1;
    } catch (error) {
      const code = (error as { extensions?: { code?: string } }).extensions
        ?.code;
      if (code === 'NOT_FOUND') continue; // Removed with a folder above.
      result.skipped.push({
        itemId: item._id,
        reason: (error as Error).message,
      });
    }
  }
  return result;
}
