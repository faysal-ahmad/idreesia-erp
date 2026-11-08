import {
  abortUpload,
  checkInDocument,
  checkOutDocument,
  createFolder,
  deleteVersion,
  emptyTrash,
  forceUnlockDocument,
  moveDocument,
  moveFolder,
  purgeFromTrash,
  renameFolder,
  restoreFromTrash,
  restoreVersion,
  trashDocument,
  trashFolder,
  updateDocument,
} from 'meteor/idreesia-common/server/business-logic/dms';
import {
  completeLibraryUpload,
  createLibraryUpload,
  getLibraryActivity,
  getLibraryDocument,
  getLibraryDownloadUrl,
  getLibraryFolderContents,
  getLibraryFolders,
  getLibraryInfo,
  getLibraryTrash,
  getLibraryVersions,
  searchLibrary,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import {
  assertDocumentInWorkspace,
  assertFolderInWorkspace,
  assertTrashItemInWorkspace,
  getDocumentsAccess,
} from './access';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

// Each resolver only checks access (committee membership + Documents
// enabled, coordinators for the destructive actions, and that ids belong to
// the committee's workspace); the DMS and the library logic do the work.
// The DMS itself enforces check-out locks, unique names and the like.
const resolvers: ResolverMap = {
  Query: {
    workspaceDocumentsInfo: async (obj, { committeeId }, { user }) => {
      const access = await getDocumentsAccess(user, committeeId);
      return {
        ...(await getLibraryInfo(access.workspaceId, access.userId)),
        canManage: access.isCoordinator,
      };
    },

    workspaceDocumentFolderContents: async (
      obj,
      { committeeId, folderId, pageIndex, pageSize },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertFolderInWorkspace(access, folderId);
      return getLibraryFolderContents(
        access.workspaceId,
        folderId ?? null,
        access.userId,
        { pageIndex, pageSize }
      );
    },

    workspaceDocumentFolders: async (obj, { committeeId }, { user }) => {
      const access = await getDocumentsAccess(user, committeeId);
      return getLibraryFolders(access.workspaceId, access.userId);
    },

    workspaceDocumentSearch: async (
      obj,
      { committeeId, text, pageIndex, pageSize },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      return searchLibrary(access.workspaceId, access.userId, {
        text,
        pageIndex,
        pageSize,
      });
    },

    workspaceDocumentById: async (
      obj,
      { committeeId, documentId },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertDocumentInWorkspace(access, documentId);
      return getLibraryDocument(documentId, access.userId);
    },

    workspaceDocumentVersions: async (
      obj,
      { committeeId, documentId },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertDocumentInWorkspace(access, documentId);
      return getLibraryVersions(documentId, access.userId);
    },

    workspaceDocumentActivity: async (
      obj,
      { committeeId, documentId, before, limit },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      if (documentId) await assertDocumentInWorkspace(access, documentId);
      return getLibraryActivity(access.workspaceId, access.userId, {
        documentId,
        before,
        limit,
      });
    },

    workspaceDocumentTrash: async (obj, { committeeId }, { user }) => {
      const access = await getDocumentsAccess(user, committeeId);
      return getLibraryTrash(access.workspaceId, access.userId);
    },
  },

  Mutation: {
    workspaceCreateDocumentFolder: async (
      obj,
      { committeeId, parentId, name },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertFolderInWorkspace(access, parentId);
      await createFolder(
        { workspaceId: access.workspaceId, parentId, name },
        access.userId
      );
      return true;
    },

    workspaceRenameDocumentFolder: async (
      obj,
      { committeeId, folderId, name },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertFolderInWorkspace(access, folderId);
      await renameFolder(folderId, name, access.userId);
      return true;
    },

    workspaceMoveDocumentFolder: async (
      obj,
      { committeeId, folderId, parentId },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertFolderInWorkspace(access, folderId);
      await assertFolderInWorkspace(access, parentId);
      await moveFolder(folderId, parentId ?? null, access.userId);
      return true;
    },

    workspaceTrashDocumentFolder: async (
      obj,
      { committeeId, folderId },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertFolderInWorkspace(access, folderId);
      await trashFolder(folderId, access.userId);
      return true;
    },

    workspaceCreateDocumentUpload: async (
      obj,
      { committeeId, ...input },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertFolderInWorkspace(access, input.folderId);
      if (input.documentId) {
        await assertDocumentInWorkspace(access, input.documentId);
      }
      return createLibraryUpload(access.workspaceId, access.userId, input);
    },

    // The DMS only lets the user who started an upload finish or abort it.
    workspaceCompleteDocumentUpload: async (
      obj,
      { committeeId, uploadId },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      return completeLibraryUpload(uploadId, access.userId);
    },

    workspaceAbortDocumentUpload: async (
      obj,
      { committeeId, uploadId },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await abortUpload(uploadId, access.userId);
      return true;
    },

    workspaceUpdateDocument: async (
      obj,
      { committeeId, documentId, name, description, tags },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertDocumentInWorkspace(access, documentId);
      await updateDocument(
        documentId,
        { name, description: description ?? null, tags: tags ?? [] },
        access.userId
      );
      return true;
    },

    workspaceMoveDocument: async (
      obj,
      { committeeId, documentId, folderId },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertDocumentInWorkspace(access, documentId);
      await assertFolderInWorkspace(access, folderId);
      await moveDocument(documentId, folderId ?? null, access.userId);
      return true;
    },

    workspaceTrashDocument: async (
      obj,
      { committeeId, documentId },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertDocumentInWorkspace(access, documentId);
      await trashDocument(documentId, access.userId);
      return true;
    },

    workspaceDocumentDownloadUrl: async (
      obj,
      { committeeId, documentId, versionId, inline },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertDocumentInWorkspace(access, documentId);
      return getLibraryDownloadUrl(documentId, access.userId, {
        versionId,
        inline,
      });
    },

    workspaceRestoreDocumentVersion: async (
      obj,
      { committeeId, documentId, versionId },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertDocumentInWorkspace(access, documentId);
      await restoreVersion(documentId, versionId, access.userId);
      return true;
    },

    workspaceDeleteDocumentVersion: async (
      obj,
      { committeeId, documentId, versionId },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId, {
        coordinator: true,
      });
      await assertDocumentInWorkspace(access, documentId);
      await deleteVersion(documentId, versionId, access.userId);
      return true;
    },

    workspaceCheckOutDocument: async (
      obj,
      { committeeId, documentId, note },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertDocumentInWorkspace(access, documentId);
      await checkOutDocument(documentId, access.userId, {
        note: note ?? undefined,
      });
      return true;
    },

    workspaceCheckInDocument: async (
      obj,
      { committeeId, documentId },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertDocumentInWorkspace(access, documentId);
      await checkInDocument(documentId, access.userId);
      return true;
    },

    workspaceForceUnlockDocument: async (
      obj,
      { committeeId, documentId },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId, {
        coordinator: true,
      });
      await assertDocumentInWorkspace(access, documentId);
      await forceUnlockDocument(documentId, access.userId);
      return true;
    },

    workspaceRestoreDocumentTrashItem: async (
      obj,
      { committeeId, itemId, newName, toRoot },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId);
      await assertTrashItemInWorkspace(access, itemId);
      await restoreFromTrash(itemId, access.userId, {
        newName: newName || undefined,
        targetFolderId: toRoot ? null : undefined,
      });
      return true;
    },

    workspacePurgeDocumentTrashItem: async (
      obj,
      { committeeId, itemId },
      { user }
    ) => {
      const access = await getDocumentsAccess(user, committeeId, {
        coordinator: true,
      });
      await assertTrashItemInWorkspace(access, itemId);
      await purgeFromTrash(itemId, access.userId);
      return true;
    },

    workspaceEmptyDocumentTrash: async (obj, { committeeId }, { user }) => {
      const access = await getDocumentsAccess(user, committeeId, {
        coordinator: true,
      });
      const { purged } = await emptyTrash(access.workspaceId, access.userId);
      return purged;
    },
  },
};

export default resolvers;
