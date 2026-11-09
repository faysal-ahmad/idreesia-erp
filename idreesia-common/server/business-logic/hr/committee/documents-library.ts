import { DMS_DEFAULT_MAX_FILE_SIZE } from 'meteor/idreesia-common/constants/dms';
import {
  completeUpload,
  createUploadUrl,
  getDocument,
  getDocumentDownloadUrl,
  getFolderPath,
  getWorkspace,
  listActivity,
  listFolderContents,
  listFolders,
  listTrash,
  listVersions,
  searchDocuments,
} from 'meteor/idreesia-common/server/business-logic/dms';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import type {
  DmsActivityDocument,
  DmsDocumentDocument,
  DmsDocumentVersionDocument,
  DmsFolderDocument,
} from 'meteor/idreesia-common/server/collections/dms';

/*
 * A committee's document library, as the Workspaces feature shows it: the
 * DMS records with user names instead of ids and timestamps as strings.
 * Callers check that the user may use the library (and that the ids belong
 * to its workspace) first.
 */

type UserNames = Map<string, string>;

const timestamp = (date?: Date) => (date ? String(date.getTime()) : null);

/** Display names of ERP users: their person's name, else their own. */
export async function getUserNames(
  userIds: Array<string | null | undefined>
): Promise<UserNames> {
  const ids = [...new Set(userIds.filter((id): id is string => !!id))];
  const names: UserNames = new Map();
  if (!ids.length) return names;

  const users = (await Users.find(
    { _id: { $in: ids } },
    { fields: { _id: 1, username: 1, personId: 1, 'profile.name': 1 } }
  ).fetchAsync()) as Array<{
    _id: string;
    username?: string;
    personId?: string;
    profile?: { name?: string };
  }>;
  const personIds = users
    .map(user => user.personId)
    .filter((id): id is string => !!id);
  const people = personIds.length
    ? ((await People.find(
        { _id: { $in: personIds } },
        { fields: { _id: 1, 'sharedData.name': 1 } }
      ).fetchAsync()) as Array<{ _id: string; sharedData?: { name?: string } }>)
    : [];
  const personNames = new Map(
    people.map(person => [person._id, person.sharedData?.name])
  );

  users.forEach(user => {
    const name =
      (user.personId && personNames.get(user.personId)) ||
      user.profile?.name ||
      user.username;
    if (name) names.set(user._id, name);
  });
  return names;
}

const nameOf = (names: UserNames, userId?: string) =>
  (userId && names.get(userId)) || null;

const isLockActive = (document: DmsDocumentDocument) =>
  !!document.lock && document.lock.expiresAt > new Date();

const toFolder = (folder: DmsFolderDocument, names: UserNames) => ({
  _id: folder._id,
  name: folder.name,
  parentId: folder.parentId ?? null,
  createdAt: timestamp(folder.createdAt),
  createdByName: nameOf(names, folder.createdBy),
  updatedAt: timestamp(folder.updatedAt),
  updatedByName: nameOf(names, folder.updatedBy),
  deletedAt: timestamp(folder.deletedAt),
  deletedByName: nameOf(names, folder.deletedBy),
});

const toDocument = (
  document: DmsDocumentDocument,
  names: UserNames,
  userId: string,
  folderName?: string | null
) => ({
  _id: document._id,
  name: document.name,
  folderId: document.folderId ?? null,
  folderName: folderName ?? null,
  description: document.description ?? null,
  tags: document.tags ?? [],
  fileName: document.fileName ?? null,
  mimeType: document.mimeType ?? null,
  size: document.size ?? null,
  currentVersionNumber: document.currentVersionNumber ?? null,
  lock: isLockActive(document)
    ? {
        userName: nameOf(names, document.lock!.userId),
        lockedAt: timestamp(document.lock!.lockedAt),
        expiresAt: timestamp(document.lock!.expiresAt),
        note: document.lock!.note ?? null,
        isMine: document.lock!.userId === userId,
      }
    : null,
  createdAt: timestamp(document.createdAt),
  createdByName: nameOf(names, document.createdBy),
  updatedAt: timestamp(document.updatedAt),
  updatedByName: nameOf(names, document.updatedBy),
  deletedAt: timestamp(document.deletedAt),
  deletedByName: nameOf(names, document.deletedBy),
});

const userIdsOf = (
  records: Array<{
    createdBy?: string;
    updatedBy?: string;
    deletedBy?: string;
    lock?: { userId: string };
  }>
) =>
  records.flatMap(record => [
    record.createdBy,
    record.updatedBy,
    record.deletedBy,
    record.lock?.userId,
  ]);

const mapFolders = async (folders: DmsFolderDocument[]) => {
  const names = await getUserNames(userIdsOf(folders));
  return folders.map(folder => toFolder(folder, names));
};

const mapDocuments = async (
  documents: DmsDocumentDocument[],
  userId: string,
  folderNames?: Map<string, string>
) => {
  const names = await getUserNames(userIdsOf(documents));
  return documents.map(document =>
    toDocument(
      document,
      names,
      userId,
      document.folderId ? folderNames?.get(document.folderId) : null
    )
  );
};

/** One document as the library shows it. */
export const toLibraryDocument = async (
  document: DmsDocumentDocument,
  userId: string
) => (await mapDocuments([document], userId))[0];

const toPage = ({
  pageIndex,
  pageSize,
}: {
  pageIndex?: number | null;
  pageSize?: number | null;
}) => {
  const limit = pageSize ?? 20;
  return { skip: (pageIndex ?? 0) * limit, limit };
};

export async function getLibraryInfo(workspaceId: string, userId: string) {
  const workspace = await getWorkspace(workspaceId, userId);
  return {
    maxFileSize: workspace.settings?.maxFileSize ?? DMS_DEFAULT_MAX_FILE_SIZE,
  };
}

export interface LibraryListOptions {
  pageIndex?: number | null;
  pageSize?: number | null;
}

/** A folder's path, subfolders and a page of its documents (null = root). */
export async function getLibraryFolderContents(
  workspaceId: string,
  folderId: string | null,
  userId: string,
  options: LibraryListOptions
) {
  const [contents, path] = await Promise.all([
    listFolderContents(workspaceId, folderId, userId, toPage(options)),
    folderId ? getFolderPath(folderId, userId) : Promise.resolve([]),
  ]);
  return {
    path: await mapFolders(path),
    folders: await mapFolders(contents.folders),
    documents: {
      data: await mapDocuments(contents.documents.data, userId),
      totalResults: contents.documents.totalResults,
    },
  };
}

/** Every folder of the library, e.g. for picking a move target. */
export async function getLibraryFolders(workspaceId: string, userId: string) {
  return mapFolders(await listFolders(workspaceId, userId));
}

const getFolderNames = async (workspaceId: string, userId: string) =>
  new Map(
    (await listFolders(workspaceId, userId)).map(folder => [
      folder._id,
      folder.name,
    ])
  );

/** Documents matching the text (name, description, tags), most relevant first. */
export async function searchLibrary(
  workspaceId: string,
  userId: string,
  { text, ...options }: LibraryListOptions & { text: string }
) {
  const [results, folderNames] = await Promise.all([
    searchDocuments(workspaceId, userId, { text, ...toPage(options) }),
    getFolderNames(workspaceId, userId),
  ]);
  return {
    data: await mapDocuments(results.data, userId, folderNames),
    totalResults: results.totalResults,
  };
}

export async function getLibraryDocument(documentId: string, userId: string) {
  return toLibraryDocument(await getDocument(documentId, userId), userId);
}

export async function getLibraryVersions(documentId: string, userId: string) {
  const [document, versions] = await Promise.all([
    getDocument(documentId, userId, { includeTrashed: true }),
    listVersions(documentId, userId),
  ]);
  const names = await getUserNames(versions.map(version => version.createdBy));
  return versions.map((version: DmsDocumentVersionDocument) => ({
    _id: version._id,
    versionNumber: version.versionNumber ?? null,
    fileName: version.fileName,
    mimeType: version.mimeType,
    size: version.size,
    comment: version.comment ?? null,
    isCurrent: version._id === document.currentVersionId,
    createdAt: timestamp(version.createdAt),
    createdByName: nameOf(names, version.createdBy),
  }));
}

/** The library's (or one document's) activity, newest first. */
export async function getLibraryActivity(
  workspaceId: string,
  userId: string,
  {
    documentId,
    before,
    limit,
  }: {
    documentId?: string | null;
    before?: string | null;
    limit?: number | null;
  }
) {
  const activity = await listActivity(workspaceId, userId, {
    documentId: documentId ?? undefined,
    before: before ? new Date(Number(before)) : undefined,
    limit: limit ?? 50,
  });
  const names = await getUserNames(activity.map(entry => entry.userId));
  return activity.map((entry: DmsActivityDocument) => ({
    _id: entry._id,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    documentId: entry.documentId ?? null,
    userName: nameOf(names, entry.userId),
    at: timestamp(entry.at),
    details: entry.details ? JSON.stringify(entry.details) : null,
  }));
}

export async function getLibraryTrash(workspaceId: string, userId: string) {
  const { folders, documents } = await listTrash(workspaceId, userId);
  return {
    folders: await mapFolders(folders),
    documents: await mapDocuments(documents, userId),
  };
}

export interface LibraryUploadInput {
  /** Add a new version to this document; unset to create a document. */
  documentId?: string | null;
  /** New documents: the folder to put it in (null = root). */
  folderId?: string | null;
  fileName: string;
  mimeType?: string | null;
  size: number;
  comment?: string | null;
}

/** Starts a direct upload; the browser PUTs the file to the returned URL. */
export async function createLibraryUpload(
  workspaceId: string,
  userId: string,
  input: LibraryUploadInput
) {
  const mimeType = input.mimeType || 'application/octet-stream';
  const ticket = await createUploadUrl(
    {
      workspaceId,
      documentId: input.documentId ?? undefined,
      folderId: input.folderId ?? null,
      fileName: input.fileName,
      mimeType,
      size: input.size,
      comment: input.comment ?? undefined,
    },
    userId
  );
  return {
    uploadId: ticket.uploadId,
    documentId: ticket.documentId,
    url: ticket.url,
    contentType: ticket.headers['Content-Type'],
    expiresAt: timestamp(ticket.expiresAt),
  };
}

/** Finishes a direct upload; returns the new or updated document. */
export async function completeLibraryUpload(uploadId: string, userId: string) {
  const { document } = await completeUpload(uploadId, userId);
  return toLibraryDocument(document, userId);
}

export async function getLibraryDownloadUrl(
  documentId: string,
  userId: string,
  { versionId, inline }: { versionId?: string | null; inline?: boolean | null }
) {
  const download = await getDocumentDownloadUrl(documentId, userId, {
    versionId: versionId ?? undefined,
    inline: !!inline,
  });
  return { url: download.url, fileName: download.fileName };
}
