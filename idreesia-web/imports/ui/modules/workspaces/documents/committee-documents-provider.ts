import type { ApolloClient } from '@apollo/client';
import type {
  WorkspaceDocumentFieldsFragment,
  WorkspaceDocumentFolderFieldsFragment,
} from 'meteor/idreesia-common/types/client-operations';

import {
  DocumentsError,
  type DocumentActivity,
  type DocumentChanges,
  type DocumentFolder,
  type DocumentItem,
  type DocumentPage,
  type DocumentsDataProvider,
  type DocumentsInfo,
  type DocumentVersion,
  type FolderContents,
  type RestoreOptions,
  type TrashContents,
  type UploadTarget,
} from '/imports/ui/modules/common/documents';

import {
  WORKSPACE_ABORT_DOCUMENT_UPLOAD,
  WORKSPACE_CHECK_IN_DOCUMENT,
  WORKSPACE_CHECK_OUT_DOCUMENT,
  WORKSPACE_COMPLETE_DOCUMENT_UPLOAD,
  WORKSPACE_CREATE_DOCUMENT_FOLDER,
  WORKSPACE_CREATE_DOCUMENT_UPLOAD,
  WORKSPACE_DELETE_DOCUMENT_VERSION,
  WORKSPACE_DOCUMENT_ACTIVITY,
  WORKSPACE_DOCUMENT_BY_ID,
  WORKSPACE_DOCUMENT_DOWNLOAD_URL,
  WORKSPACE_DOCUMENT_FOLDER_CONTENTS,
  WORKSPACE_DOCUMENT_FOLDERS,
  WORKSPACE_DOCUMENT_SEARCH,
  WORKSPACE_DOCUMENT_TRASH,
  WORKSPACE_DOCUMENT_VERSIONS,
  WORKSPACE_DOCUMENTS_INFO,
  WORKSPACE_EMPTY_DOCUMENT_TRASH,
  WORKSPACE_FORCE_UNLOCK_DOCUMENT,
  WORKSPACE_MOVE_DOCUMENT,
  WORKSPACE_MOVE_DOCUMENT_FOLDER,
  WORKSPACE_PURGE_DOCUMENT_TRASH_ITEM,
  WORKSPACE_RENAME_DOCUMENT_FOLDER,
  WORKSPACE_RESTORE_DOCUMENT_TRASH_ITEM,
  WORKSPACE_RESTORE_DOCUMENT_VERSION,
  WORKSPACE_TRASH_DOCUMENT,
  WORKSPACE_TRASH_DOCUMENT_FOLDER,
  WORKSPACE_UPDATE_DOCUMENT,
} from './gql';

const notNull = <T>(value: T | null | undefined): value is T => value != null;

/** The server's message and error code, from an Apollo or network error. */
const toDocumentsError = (error: unknown): DocumentsError => {
  if (error instanceof DocumentsError) return error;
  const [graphQLError] =
    (
      error as {
        errors?: Array<{ message?: string; extensions?: { code?: unknown } }>;
      }
    )?.errors ?? [];
  if (graphQLError?.message) {
    const code = graphQLError.extensions?.code;
    return new DocumentsError(
      graphQLError.message,
      typeof code === 'string' ? code : null
    );
  }
  return new DocumentsError(
    error instanceof Error ? error.message : 'Something went wrong.'
  );
};

const mapFolder = (
  folder: WorkspaceDocumentFolderFieldsFragment
): DocumentFolder => ({
  _id: folder._id!,
  name: folder.name ?? '',
  parentId: folder.parentId ?? null,
  updatedAt: folder.updatedAt ?? null,
  updatedByName: folder.updatedByName ?? null,
  deletedAt: folder.deletedAt ?? null,
  deletedByName: folder.deletedByName ?? null,
});

const mapFolders = (
  folders:
    Array<WorkspaceDocumentFolderFieldsFragment | null> | null | undefined
) =>
  (folders ?? [])
    .filter(notNull)
    .filter(f => !!f._id)
    .map(mapFolder);

const mapDocument = (
  document: WorkspaceDocumentFieldsFragment
): DocumentItem => ({
  _id: document._id!,
  name: document.name ?? '',
  folderId: document.folderId ?? null,
  folderName: document.folderName ?? null,
  description: document.description ?? null,
  tags: (document.tags ?? []).filter(notNull),
  fileName: document.fileName ?? null,
  mimeType: document.mimeType ?? null,
  size: document.size ?? null,
  currentVersionNumber: document.currentVersionNumber ?? null,
  lock: document.lock
    ? {
        userName: document.lock.userName ?? null,
        lockedAt: document.lock.lockedAt ?? null,
        expiresAt: document.lock.expiresAt ?? null,
        note: document.lock.note ?? null,
        isMine: !!document.lock.isMine,
      }
    : null,
  createdAt: document.createdAt ?? null,
  createdByName: document.createdByName ?? null,
  updatedAt: document.updatedAt ?? null,
  updatedByName: document.updatedByName ?? null,
  deletedAt: document.deletedAt ?? null,
  deletedByName: document.deletedByName ?? null,
});

const mapDocuments = (
  documents: Array<WorkspaceDocumentFieldsFragment | null> | null | undefined
) =>
  (documents ?? [])
    .filter(notNull)
    .filter(d => !!d._id)
    .map(mapDocument);

const parseDetails = (details: string | null | undefined) => {
  if (!details) return {};
  try {
    return JSON.parse(details) as Record<string, unknown>;
  } catch {
    return {};
  }
};

/**
 * PUTs a file to a presigned storage URL. XMLHttpRequest rather than fetch,
 * for upload progress.
 */
const putFile = (
  url: string,
  file: File,
  contentType: string,
  onProgress?: (fraction: number) => void
) =>
  new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', url);
    request.setRequestHeader('Content-Type', contentType);
    request.upload.onprogress = event => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else {
        reject(
          new DocumentsError(`Could not upload the file (${request.status}).`)
        );
      }
    };
    request.onerror = () =>
      reject(new DocumentsError('Could not upload the file.'));
    request.send(file);
  });

/**
 * Document library data for a committee in Workspaces: GraphQL for
 * everything, and direct uploads to storage through presigned URLs.
 */
export default class CommitteeDocumentsProvider implements DocumentsDataProvider {
  constructor(
    private readonly client: ApolloClient,
    private readonly committeeId: string
  ) {}

  private async run<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      throw toDocumentsError(error);
    }
  }

  private mutate(
    mutation: Parameters<ApolloClient['mutate']>[0]['mutation'],
    variables: Record<string, unknown>
  ) {
    return this.run(() =>
      this.client.mutate({
        mutation,
        variables: { committeeId: this.committeeId, ...variables },
      })
    );
  }

  getInfo(): Promise<DocumentsInfo> {
    return this.run(async () => {
      const { data } = await this.client.query({
        query: WORKSPACE_DOCUMENTS_INFO,
        variables: { committeeId: this.committeeId },
        fetchPolicy: 'network-only',
      });
      return {
        canManage: !!data?.workspaceDocumentsInfo?.canManage,
        maxFileSize: data?.workspaceDocumentsInfo?.maxFileSize ?? 0,
      };
    });
  }

  loadFolderContents(
    folderId: string | null,
    pageIndex: number,
    pageSize: number
  ): Promise<FolderContents> {
    return this.run(async () => {
      const { data } = await this.client.query({
        query: WORKSPACE_DOCUMENT_FOLDER_CONTENTS,
        variables: {
          committeeId: this.committeeId,
          folderId,
          pageIndex,
          pageSize,
        },
        fetchPolicy: 'network-only',
      });
      const contents = data?.workspaceDocumentFolderContents;
      return {
        path: mapFolders(contents?.path),
        folders: mapFolders(contents?.folders),
        documents: mapDocuments(contents?.documents?.data),
        totalDocuments: contents?.documents?.totalResults ?? 0,
      };
    });
  }

  loadFolders(): Promise<DocumentFolder[]> {
    return this.run(async () => {
      const { data } = await this.client.query({
        query: WORKSPACE_DOCUMENT_FOLDERS,
        variables: { committeeId: this.committeeId },
        fetchPolicy: 'network-only',
      });
      return mapFolders(data?.workspaceDocumentFolders);
    });
  }

  searchDocuments(
    text: string,
    pageIndex: number,
    pageSize: number
  ): Promise<DocumentPage> {
    return this.run(async () => {
      const { data } = await this.client.query({
        query: WORKSPACE_DOCUMENT_SEARCH,
        variables: { committeeId: this.committeeId, text, pageIndex, pageSize },
        fetchPolicy: 'network-only',
      });
      return {
        documents: mapDocuments(data?.workspaceDocumentSearch?.data),
        totalResults: data?.workspaceDocumentSearch?.totalResults ?? 0,
      };
    });
  }

  loadDocument(documentId: string): Promise<DocumentItem | null> {
    return this.run(async () => {
      const { data } = await this.client.query({
        query: WORKSPACE_DOCUMENT_BY_ID,
        variables: { committeeId: this.committeeId, documentId },
        fetchPolicy: 'network-only',
      });
      const document = data?.workspaceDocumentById;
      return document?._id ? mapDocument(document) : null;
    });
  }

  loadVersions(documentId: string): Promise<DocumentVersion[]> {
    return this.run(async () => {
      const { data } = await this.client.query({
        query: WORKSPACE_DOCUMENT_VERSIONS,
        variables: { committeeId: this.committeeId, documentId },
        fetchPolicy: 'network-only',
      });
      return (data?.workspaceDocumentVersions ?? [])
        .filter(notNull)
        .filter(version => !!version._id)
        .map(version => ({
          _id: version._id!,
          versionNumber: version.versionNumber ?? null,
          fileName: version.fileName ?? '',
          mimeType: version.mimeType ?? '',
          size: version.size ?? 0,
          comment: version.comment ?? null,
          isCurrent: !!version.isCurrent,
          createdAt: version.createdAt ?? null,
          createdByName: version.createdByName ?? null,
        }));
    });
  }

  loadActivity(
    documentId: string,
    before?: string
  ): Promise<DocumentActivity[]> {
    return this.run(async () => {
      const { data } = await this.client.query({
        query: WORKSPACE_DOCUMENT_ACTIVITY,
        variables: {
          committeeId: this.committeeId,
          documentId,
          before: before ?? null,
          limit: 50,
        },
        fetchPolicy: 'network-only',
      });
      return (data?.workspaceDocumentActivity ?? [])
        .filter(notNull)
        .filter(entry => !!entry._id)
        .map(entry => ({
          _id: entry._id!,
          action: entry.action ?? '',
          userName: entry.userName ?? null,
          at: entry.at ?? null,
          details: parseDetails(entry.details),
        }));
    });
  }

  loadTrash(): Promise<TrashContents> {
    return this.run(async () => {
      const { data } = await this.client.query({
        query: WORKSPACE_DOCUMENT_TRASH,
        variables: { committeeId: this.committeeId },
        fetchPolicy: 'network-only',
      });
      return {
        folders: mapFolders(data?.workspaceDocumentTrash?.folders),
        documents: mapDocuments(data?.workspaceDocumentTrash?.documents),
      };
    });
  }

  async createFolder(parentId: string | null, name: string): Promise<void> {
    await this.mutate(WORKSPACE_CREATE_DOCUMENT_FOLDER, { parentId, name });
  }

  async renameFolder(folderId: string, name: string): Promise<void> {
    await this.mutate(WORKSPACE_RENAME_DOCUMENT_FOLDER, { folderId, name });
  }

  async moveFolder(folderId: string, parentId: string | null): Promise<void> {
    await this.mutate(WORKSPACE_MOVE_DOCUMENT_FOLDER, { folderId, parentId });
  }

  async trashFolder(folderId: string): Promise<void> {
    await this.mutate(WORKSPACE_TRASH_DOCUMENT_FOLDER, { folderId });
  }

  uploadFile(
    file: File,
    { folderId, documentId, comment }: UploadTarget,
    onProgress?: (fraction: number) => void
  ): Promise<void> {
    return this.run(async () => {
      const { data } = await this.client.mutate({
        mutation: WORKSPACE_CREATE_DOCUMENT_UPLOAD,
        variables: {
          committeeId: this.committeeId,
          folderId: folderId ?? null,
          documentId: documentId ?? null,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          comment: comment ?? null,
        },
      });
      const upload = data?.workspaceCreateDocumentUpload;
      if (!upload?.uploadId || !upload.url) {
        throw new DocumentsError('Could not start the upload.');
      }

      try {
        await putFile(
          upload.url,
          file,
          upload.contentType || file.type || 'application/octet-stream',
          onProgress
        );
        await this.client.mutate({
          mutation: WORKSPACE_COMPLETE_DOCUMENT_UPLOAD,
          variables: {
            committeeId: this.committeeId,
            uploadId: upload.uploadId,
          },
        });
      } catch (error) {
        // Best effort: don't leave a pending upload (and its bytes) behind.
        await this.client
          .mutate({
            mutation: WORKSPACE_ABORT_DOCUMENT_UPLOAD,
            variables: {
              committeeId: this.committeeId,
              uploadId: upload.uploadId,
            },
          })
          .catch(() => undefined);
        throw error;
      }
    });
  }

  async updateDocument(
    documentId: string,
    { name, description, tags }: DocumentChanges
  ): Promise<void> {
    await this.mutate(WORKSPACE_UPDATE_DOCUMENT, {
      documentId,
      name,
      description,
      tags,
    });
  }

  async moveDocument(
    documentId: string,
    folderId: string | null
  ): Promise<void> {
    await this.mutate(WORKSPACE_MOVE_DOCUMENT, { documentId, folderId });
  }

  async trashDocument(documentId: string): Promise<void> {
    await this.mutate(WORKSPACE_TRASH_DOCUMENT, { documentId });
  }

  getDownloadUrl(documentId: string, versionId?: string): Promise<string> {
    return this.run(async () => {
      const { data } = await this.client.mutate({
        mutation: WORKSPACE_DOCUMENT_DOWNLOAD_URL,
        variables: {
          committeeId: this.committeeId,
          documentId,
          versionId: versionId ?? null,
        },
      });
      const url = data?.workspaceDocumentDownloadUrl?.url;
      if (!url) throw new DocumentsError('Could not get a download link.');
      return url;
    });
  }

  async restoreVersion(documentId: string, versionId: string): Promise<void> {
    await this.mutate(WORKSPACE_RESTORE_DOCUMENT_VERSION, {
      documentId,
      versionId,
    });
  }

  async deleteVersion(documentId: string, versionId: string): Promise<void> {
    await this.mutate(WORKSPACE_DELETE_DOCUMENT_VERSION, {
      documentId,
      versionId,
    });
  }

  async checkOut(
    documentId: string,
    durationMinutes: number,
    note?: string
  ): Promise<void> {
    await this.mutate(WORKSPACE_CHECK_OUT_DOCUMENT, {
      documentId,
      durationMinutes,
      note: note ?? null,
    });
  }

  async checkIn(documentId: string): Promise<void> {
    await this.mutate(WORKSPACE_CHECK_IN_DOCUMENT, { documentId });
  }

  async forceUnlock(documentId: string): Promise<void> {
    await this.mutate(WORKSPACE_FORCE_UNLOCK_DOCUMENT, { documentId });
  }

  async restoreTrashItem(
    itemId: string,
    { newName, toRoot }: RestoreOptions = {}
  ): Promise<void> {
    await this.mutate(WORKSPACE_RESTORE_DOCUMENT_TRASH_ITEM, {
      itemId,
      newName: newName ?? null,
      toRoot: !!toRoot,
    });
  }

  async purgeTrashItem(itemId: string): Promise<void> {
    await this.mutate(WORKSPACE_PURGE_DOCUMENT_TRASH_ITEM, { itemId });
  }

  emptyTrash(): Promise<number> {
    return this.run(async () => {
      const { data } = await this.client.mutate({
        mutation: WORKSPACE_EMPTY_DOCUMENT_TRASH,
        variables: { committeeId: this.committeeId },
      });
      return data?.workspaceEmptyDocumentTrash ?? 0;
    });
  }
}
