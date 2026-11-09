# Document Management System (DMS)

## Contents

- [Overview](#overview)
  - [Workspaces](#workspaces)
  - [Folders](#folders)
  - [Documents and versions](#documents-and-versions)
  - [Trash](#trash)
  - [Tags and metadata](#tags-and-metadata)
  - [Names](#names)
- [Where things live](#where-things-live)
- [Responsibilities: caller vs. module](#responsibilities-caller-vs-module)
- [Errors](#errors)
- [Paging and sorting](#paging-and-sorting)
- [API reference](#api-reference)
  - [Workspaces](#workspaces-1)
  - [Folders](#folders-1)
  - [Documents](#documents)
  - [Versions](#versions)
  - [Direct uploads (browser → storage)](#direct-uploads-browser--storage)
  - [Check-out locks](#check-out-locks)
  - [Trash](#trash-1)
  - [Search](#search)
  - [Activity log](#activity-log)
- [Notifications](#notifications)
- [Data model](#data-model)
- [Integrating a feature: example](#integrating-a-feature-example)
- [Limits and constants](#limits-and-constants)
- [Known limitations](#known-limitations)

## Overview

### Workspaces
A workspace is the top-level container. It has a name, an optional description, free-form `metadata`, and optional `settings`:

| Setting | Meaning | Default |
|---|---|---|
| `maxFileSize` | Largest upload in bytes | `DMS_DEFAULT_MAX_FILE_SIZE` (100 MB) |
| `allowedMimeTypes` | Exact types (`application/pdf`) or wildcards (`image/*`) | Any type |

Deleting a workspace is a soft delete. While it is deleted, every operation on its folders and documents fails with `NOT_FOUND`. It can be restored, or purged, which removes everything permanently.

### Folders
Folders nest to any depth. Pass `null` (or leave the field unset) for the workspace root. Each folder stores `parentId` and `ancestorIds` (the ids of the folders above it, root first), so subtree queries and breadcrumbs are cheap.

### Documents and versions
- **Document:** the named, listable item. It holds name, description, tags, metadata, its folder, its lock, and a copy of the current version's `fileName`, `mimeType` and `size`.
- **Version:** one stored file. Versions are numbered 1, 2, 3, … per document. `currentVersionId` and `currentVersionNumber` on the document point to the newest one.
- **Storage key:** each version is its own object, `dms-documents/<workspaceId>/<documentId>/<versionId>.<ext>`, and is never overwritten.
- **Checksums:** server-side uploads record a SHA-256. Direct uploads record the storage ETag, plus a SHA-256 if the client provides one.

### Trash
- **Trashing:** a trashed document, or a trashed folder with everything inside it, disappears from listings, search and normal reads.
- **The trash item:** only the item you trashed shows in `listTrash`. Its contents carry `trashRootId` pointing at it and are restored or purged with it.
- **Restore** puts the item back, by default in its original folder.
- **Purge** deletes the item and its files permanently.

### Tags and metadata
- **Tags** are trimmed, lower-cased and de-duplicated. A document can have at most 50, each at most 64 characters.
- **Metadata** is a plain object of top-level keys. Keys may use letters, digits, `_` and `-` only, at most 64 characters. Values can be any JSON value, but search only matches top-level values exactly.

### Names
Folder, document and file names are trimmed and runs of whitespace are collapsed. A name must be 1–255 characters and must not contain `/`, `\` or control characters. `.` and `..` are not allowed.

## Where things live

The DMS is a **headless backend module**: it stores documents in workspaces, with folders, version history, check-out locks, trash, tags, metadata, search and an activity log. It has no GraphQL API, REST routes or UI of its own. A feature that needs document storage calls its functions from its own resolvers or routes.

Files live in the S3-compatible object storage (RustFS locally, DigitalOcean Spaces in production). Mongo holds only metadata and object keys.

| Piece | Location |
|---|---|
| Public API (import from here) | `idreesia-common/server/business-logic/dms/` |
| Notifications (publishing and the scheduled job) | `idreesia-common/server/business-logic/dms/notifications.ts` |
| Headless module wrapper (`dmsModule`) | `idreesia-common/server/business-logic/dms/module.ts` |
| Collections and document types | `idreesia-common/server/collections/dms/` |
| Schemas | `idreesia-common/server/schemas/dms/` |
| Constants (actions, limits) | `idreesia-common/constants/dms.ts` |
| Storage helpers | `idreesia-common/server/file-storage/` |
| Indexes | `idreesia-web/imports/startup/server/migrations/60-create-dms-indexes.ts` |

```ts
import {
  createWorkspace,
  uploadDocument,
  checkOutDocument,
} from 'meteor/idreesia-common/server/business-logic/dms';
```

The module is server-only. Import from the barrel above, not from individual files inside it.

## Responsibilities: caller vs. module

**The caller decides access.** The DMS never checks whether a user may see or change a workspace, folder or document. Before calling the DMS, the consuming feature must:
- authenticate the user,
- check its own permissions (for example "is this user a member of the committee that owns this workspace"),
- and make sure the ids it passes belong to what the user may touch.

**The module enforces integrity.** Whoever calls it, the DMS guarantees:
- **Locks hold.** Only the holder of a check-out lock can change the document (see [Check-out locks](#check-out-locks)).
- **Names are unique within a folder.** The check ignores case, and trashed items don't count.
- **Folders can't be moved into themselves** or into one of their own subfolders.
- **Version history is append-only.** Restoring an old version adds a copy as the newest version. The current version can't be deleted.
- **Upload limits apply** (size and MIME type, per workspace).
- **Only the user who started a direct upload** can complete or abort it.

**Every function takes the acting `userId`**, reads included. It is recorded in `createdBy` / `updatedBy` / `deletedBy`, used as the lock holder, and written to the activity log. A missing or empty `userId` fails with `BAD_USER_INPUT`. The only exception is the maintenance function `purgeExpiredUploads()`.

**Workspaces are independent.** A DMS workspace has no link to ERP Workspaces (committees), profiles or any other entity. The consuming feature stores the DMS workspace id on its own records, for example `committee.dmsWorkspaceId`, and uses the `metadata` field for anything else it needs.

## Errors

Every failure is a `GraphQLError` with `extensions.code`, so a GraphQL resolver can let it propagate unchanged. A REST route should map the codes to HTTP statuses, for example:

| `extensions.code` | Meaning | Suggested HTTP |
|---|---|---|
| `NOT_FOUND` | No such workspace, folder, document, version or upload. Also returned when the item is trashed or its workspace is deleted. | 404 |
| `CONFLICT` | Name already taken; item not in a state for the operation (e.g. deleting the current version, purging a workspace that isn't deleted, restoring into a folder that no longer exists); concurrent change | 409 |
| `LOCKED` | Another user has the document checked out. `extensions` also has `lockedBy`, `lockedAt` and `lockExpiresAt`. | 423 |
| `BAD_USER_INPUT` | Invalid name, tags, metadata, MIME type, size, or a cyclic folder move | 400 |
| `FORBIDDEN` | Completing or aborting someone else's direct upload | 403 |
| `TOO_LARGE` | File is over the workspace's `maxFileSize`. `extensions.maxFileSize` gives the limit. | 413 |
| `UPLOAD_INCOMPLETE` | Direct upload not yet PUT, size mismatch, or expired | 409 / 400 |

Map any other error to a 500.

## Paging and sorting

List and search functions return `{ data, totalResults }` (`DmsPage<T>`) and accept:

| Option | Default | Notes |
|---|---|---|
| `skip` | `0` | |
| `limit` | `50` | Capped at `200` |
| `sortBy` | `'name'` | `'name' \| 'createdAt' \| 'updatedAt' \| 'size'`. Documents only. |
| `sortOrder` | `'asc'` | `'asc' \| 'desc'` |

## API reference

Every function is `async`. "Doc" types are exported from `collections/dms`: `DmsWorkspaceDocument`, `DmsFolderDocument`, `DmsDocumentDocument`, `DmsDocumentVersionDocument` and `DmsActivityDocument`.

### Workspaces

| Function | Returns | Notes |
|---|---|---|
| `createWorkspace({ name, description?, metadata?, settings? }, userId)` | workspace | |
| `updateWorkspace(workspaceId, { name?, description?, metadata?, settings? }, userId)` | workspace | `metadata` and `settings` replace the whole object. `null` clears `description`, `metadata` or `settings`. |
| `getWorkspace(workspaceId, userId, { includeDeleted? })` | workspace | |
| `listWorkspaces(userId, { workspaceIds?, nameContains?, includeDeleted?, onlyDeleted?, skip?, limit? })` | `DmsPage<workspace>` | Pass `workspaceIds` to list only the workspaces your feature owns. |
| `deleteWorkspace(workspaceId, userId)` | – | Soft delete |
| `restoreWorkspace(workspaceId, userId)` | workspace | |
| `purgeWorkspace(workspaceId, userId)` | – | Only works on a deleted workspace (otherwise `CONFLICT`). Removes all folders, documents, versions, files and activity, ignoring locks. |

### Folders

| Function | Returns | Notes |
|---|---|---|
| `createFolder({ workspaceId, parentId?, name }, userId)` | folder | `parentId` unset or `null` = root |
| `getFolder(folderId, userId, { includeTrashed? })` | folder | |
| `renameFolder(folderId, newName, userId)` | folder | |
| `moveFolder(folderId, newParentId \| null, userId)` | folder | Moves the whole subtree. Fails with `BAD_USER_INPUT` if the target is the folder itself or inside it. |
| `getFolderPath(folderId, userId)` | folder[] | Root first, ending with the folder itself (for breadcrumbs) |
| `listFolderContents(workspaceId, folderId \| null, userId, { skip?, limit?, sortBy?, sortOrder? })` | `{ folders, documents: DmsPage }` | All subfolders sorted by name, plus one page of documents |
| `listFolders(workspaceId, userId)` | folder[] | Every live folder in the workspace, sorted by name (e.g. for a folder picker; build the tree from `parentId`) |

Delete a folder with `trashFolder` (see [Trash](#trash-1)).

### Documents

| Function | Returns | Notes |
|---|---|---|
| `uploadDocument({ workspaceId, folderId?, name?, fileName, body, mimeType, description?, tags?, metadata?, comment? }, userId)` | `{ document, version }` | `body` is a `Buffer`. `name` defaults to `fileName`. Creates version 1. |
| `getDocument(documentId, userId, { includeTrashed? })` | document | |
| `updateDocument(documentId, { name?, description?, tags?, metadata? }, userId)` | document | `tags` and `metadata` replace the current values. `null` clears `description` or `metadata`. Lock-checked. |
| `moveDocument(documentId, targetFolderId \| null, userId)` | document | Lock-checked |
| `copyDocument(documentId, userId, { targetFolderId?, name? })` | `{ document, version }` | Copies only the current version, as version 1 of the new document. `targetFolderId` unset means the same folder; `null` means root. `name` defaults to `"<name> (copy).<ext>"`. |
| `getDocumentDownloadUrl(documentId, userId, { versionId?, inline?, expiresInSec? })` | `DocumentDownload` | Presigned GET that saves under the version's original file name. `inline: true` lets the browser display it. Defaults to the current version and `DMS_DOWNLOAD_URL_EXPIRY_SECONDS` (15 min). Logged as a download. |
| `readDocumentContent(documentId, userId, { versionId? })` | `{ body, fileName, mimeType, version }` | Reads the bytes on the server, e.g. for processing or proxying. Loads the whole file into memory. Logged as a download. |

`DocumentDownload` is `{ url, expiresAt, fileName, mimeType, size, versionId, versionNumber }`.

Trashed documents can't be downloaded; restore them first.

### Versions

| Function | Returns | Notes |
|---|---|---|
| `uploadNewVersion(documentId, { body, mimeType, fileName?, comment? }, userId)` | version | `fileName` defaults to the current file name. Lock-checked. |
| `listVersions(documentId, userId)` | version[] | Newest first. Works on trashed documents too. |
| `restoreVersion(documentId, versionId, userId, { comment? })` | version | Copies the old version into a new, newest version. Lock-checked. |
| `deleteVersion(documentId, versionId, userId)` | – | Permanently removes an old version and its file. Fails with `CONFLICT` for the current version. Lock-checked. |

### Direct uploads (browser → storage)

`uploadDocument` and `uploadNewVersion` take the whole file as a `Buffer` in server memory. For large files, let the client upload straight to storage instead:

1. **Start:** the server calls `createUploadUrl(input, userId)` and returns the ticket to the client.
2. **Upload:** the client `PUT`s the raw file bytes to `ticket.url` with `ticket.headers`. These include `Content-Type`, which must match exactly.
3. **Finish:** the server calls `completeUpload(ticket.uploadId, userId, { sha256? })`.

`completeUpload` checks that the file is in storage, that its size equals the declared `size` and that it is within limits. It then creates the document, or adds the version, and returns `{ document, version }`.

**`createUploadUrl` input:**

| Field | Notes |
|---|---|
| `workspaceId` | Always required |
| `fileName`, `mimeType`, `size` | `size` is the exact byte count of the file |
| `documentId` | Set it to add a new version; leave it unset to create a document. A new version is lock-checked both when starting and when completing. |
| `folderId`, `name`, `description`, `tags`, `metadata` | New documents only. `name` defaults to `fileName` and is checked for conflicts at start and again at completion. |
| `comment` | Optional |

**Returned ticket:** `{ uploadId, documentId, url, method: 'PUT', headers, expiresAt }`. The URL is valid for `DMS_UPLOAD_URL_EXPIRY_SECONDS` (15 min). The upload must be completed before then, or it fails with `UPLOAD_INCOMPLETE`. For a new document, `documentId` is reserved up front, but the document only exists after completion.

**Other upload functions:**

| Function | Notes |
|---|---|
| `abortUpload(uploadId, userId)` | Removes the pending upload and any uploaded bytes |
| `purgeExpiredUploads()` | Maintenance: removes expired pending uploads and their files, and returns the count. Nothing schedules it yet, so call it from a job or an admin action. |

If `completeUpload` fails (e.g. the name is now taken), the upload stays pending, so the client can retry or abort it.

**Storage CORS:** browsers can only PUT to the bucket if it has a CORS rule. Local RustFS gets one from `docker-compose.yml` (re-run the `rustfs-defaultbuckets` service if your bucket predates it). The production Spaces bucket must be given a rule by hand, allowing `PUT` (and `GET`/`HEAD`) from the ERP's origin, with `Content-Type` as an allowed header.

### Check-out locks

| Function | Returns | Notes |
|---|---|---|
| `checkOutDocument(documentId, userId, { expiresInMinutes?, note? })` | document | **Every lock expires.** `expiresInMinutes` defaults to 7 days and cannot exceed 7 days (10,080 minutes); zero, negative, non-numeric or longer durations fail with `BAD_USER_INPUT`. When the holder calls it again, the lock is renewed for the new duration, counted from now. Fails with `LOCKED` if someone else holds it. |
| `checkInDocument(documentId, userId, { newVersion? })` | document | Only the holder can check in. `newVersion` (same shape as `uploadNewVersion` input) is uploaded before the lock is released. |
| `forceUnlockDocument(documentId, userId)` | document | Removes anyone's lock and logs who held it. The module doesn't restrict it, so callers must limit it (e.g. to managers). |
| `getLockStatus(documentId, userId)` | `{ isLocked, isLockedByOther, lock? }` | `lock` is `{ userId, lockedAt, expiresAt, note? }`; `expiresAt` is always set |

**Lock rules.** While user A holds an active lock, any other user gets `LOCKED` from:
- `updateDocument`, `moveDocument`, `trashDocument`
- `uploadNewVersion`, `restoreVersion`, `deleteVersion`
- `createUploadUrl` and `completeUpload` for that document
- `restoreFromTrash` and `purgeFromTrash` of it
- `trashFolder` or `purgeFromTrash` on any folder containing it

Reads, downloads and `copyDocument` are not blocked. A lock whose `expiresAt` has passed counts as released, and nothing needs to clean it up. Locks are checked in the same database write as the change, so a lock taken concurrently can't be bypassed.

### Trash

| Function | Returns | Notes |
|---|---|---|
| `trashDocument(documentId, userId)` | – | Lock-checked |
| `trashFolder(folderId, userId)` | – | Trashes the folder, its subfolders and their documents as one item. Refused while another user holds a lock on any of those documents. |
| `listTrash(workspaceId, userId)` | `{ folders, documents }` | Only the items trashed directly, most recent first |
| `restoreFromTrash(itemId, userId, { newName?, targetFolderId? })` | – | Restores a trash item (folder or document id) and everything trashed with it. See below. |
| `purgeFromTrash(itemId, userId)` | – | Permanent. For a folder, this removes everything below it, including items that were trashed separately earlier. |
| `emptyTrash(workspaceId, userId, { olderThanDays? })` | `{ purged, skipped }` | Purges every trash item, or only those trashed at least `olderThanDays` ago. Items that fail (e.g. locked) are listed in `skipped` with a reason. |

**`restoreFromTrash` rules:**
- **Target folder:** defaults to the item's original folder. If that folder has been trashed or purged, the call fails with `CONFLICT`; pass `targetFolderId` (or `null` for root) instead.
- **Name conflict:** if the name is now taken in the target folder, the call fails with `CONFLICT`; pass `newName`.
- **Items inside a trashed folder** can't be restored or purged individually (`CONFLICT`, with `extensions.trashRootId`). Act on the folder instead.

### Search

`searchDocuments(workspaceId, userId, options)` returns `DmsPage<DmsSearchResult>`. It searches live (non-trashed) documents only.

| Option | Matches |
|---|---|
| `text` | Whole words in name, description and tags. Name matches rank highest. No stemming and no partial words: `report` matches `Report.txt` but `rep` doesn't. File contents are not searched. |
| `tags` | Documents that have **all** of these tags |
| `mimeTypes` | Any of these types; `image/*` wildcards are allowed |
| `folderId` | Only this folder (`null` = root). Unset means the whole workspace. |
| `includeSubfolders` | With `folderId`: also every folder below it |
| `metadata` | `{ key: value }`: exact match on top-level metadata values |
| `createdBy` | Documents created by this user |
| `updatedAfter`, `updatedBefore` | `updatedAt` range |
| `skip`, `limit`, `sortBy`, `sortOrder` | See [Paging and sorting](#paging-and-sorting) |

With `text` and no `sortBy`, results are ordered by relevance, and each result has a `score`.

### Activity log

`listActivity(workspaceId, userId, { documentId?, entityId?, before?, limit? })` returns `DmsActivityDocument[]`, newest first. It works on deleted workspaces too.
- **Paging:** pass the last entry's `at` as `before` to get the next page.
- **Entry shape:** `{ workspaceId, entityType, entityId, documentId?, action, userId, at, details? }`.
- **`entityType`:** `workspace`, `folder`, `document` or `version`.
- **`details`:** depends on the action, e.g. `{ from, to }` for renames and moves, `{ versionNumber }` for version actions, `{ previousHolder }` for force-unlocks.

The DMS logs every change automatically, plus downloads. The `action` values (`DmsAction` in `constants/dms.ts`) are:

| Area | Actions |
|---|---|
| Workspace | `workspace-created`, `workspace-updated`, `workspace-deleted`, `workspace-restored` |
| Folder | `folder-created`, `folder-renamed`, `folder-moved`, `folder-trashed`, `folder-restored`, `folder-purged` |
| Document | `document-created`, `document-updated`, `document-moved`, `document-copied`, `document-trashed`, `document-restored`, `document-purged`, `document-downloaded`, `document-checked-out`, `document-checked-in`, `document-force-unlocked` |
| Version | `version-added`, `version-restored`, `version-deleted` |

A workspace purge deletes its activity log as well.

## Notifications

The DMS publishes four notifications through the shared notifier (see [headless-module-notifications.md](headless-module-notifications.md) for how that works). Publishing is **best effort**: a failure is logged and never fails the DMS operation that caused it. Recipients and actors are ERP user ids, the same ids the DMS uses everywhere else. For all four, `entityType` is `document` and `entityId` is the document id.

| # | Notification | Trigger | Who gets it | Id |
|---|---|---|---|---|
| 1 | Your lock on "X" was removed by someone else | `forceUnlockDocument` | The previous lock holder (the user who forced it is the actor). Nothing is sent if the holder removes their own lock. | `force-unlocked:<docId>:<lockedAtMs>` |
| 2 | Your lock on "X" expires soon | The scheduled job (below) | The lock holder | `lock-expiring:<docId>:<lockedAtMs>` |
| 3 | New document "X" | `uploadDocument`, `copyDocument`, `completeUpload` (new document) | Everyone in the workspace; the creator is the actor and is not shown it | `document-added:<docId>` |
| 4 | New version of "X" (version N) | `uploadNewVersion`, `restoreVersion`, `completeUpload` (new version) | Everyone in the workspace; the uploader is the actor | `version-added:<docId>` |

**Details**
- **#2 only for long locks.** To avoid noise it is sent only for a lock that lasted longer than 24 hours, once it is within 24 hours of expiring. A 1-hour lock never produces it. The notification expires when the lock does.
- **#2 is withdrawn** when the holder checks in, when the lock is force-unlocked, and when the holder renews (a renewal changes `lockedAt`, so the old warning is retired and a new one can follow).
- **#4 collapses.** There is one id per document, so several new versions give one notification whose details and `data: { versionNumber }` change. It shows as unread again each time.
- **A new document is only #3.** Creating a document also creates its version 1, but version 1 never produces #4.
- **Not notifications:** downloads, moves, renames, trash, restore, purge, and folder and workspace events. Nobody needs to act on them, and the [activity log](#activity-log) records them.

**The scheduled job.** `publish-dms-lock-expiring-notifications` runs hourly (`0 * * * *`; see [jobs-scheduling.md](../jobs-scheduling.md)). It finds live documents with an active lock that expires within 24 hours and lasted longer than 24 hours, and publishes #2 for each. Running it again changes nothing, so a warning someone has read stays read.

**As a headless module.** `dmsModule` (`name: 'dms'`) wraps workspace create and soft-delete for the shared `HeadlessModule` contract. `addUser` and `removeUser` do nothing, because the DMS keeps no membership (callers decide who may use a workspace). It is registered in `headless/modules.ts`.

## Data model

| Collection | Holds |
|---|---|
| `dms-workspaces` | name, description, metadata, settings, timestamps, `deletedAt`/`deletedBy` |
| `dms-folders` | `workspaceId`, `parentId?`, `ancestorIds`, `name`, `nameLower`, `trashed`, `trashRootId?`, timestamps |
| `dms-documents` | `workspaceId`, `folderId?`, `name`, `nameLower`, `description?`, `tags`, `metadata?`, `versionCount`, `currentVersionId`, `currentVersionNumber`, `fileName`, `mimeType`, `size`, `lock?` (`{ userId, lockedAt, expiresAt, note? }`), `trashed`, `trashRootId?`, timestamps |
| `dms-document-versions` | `workspaceId`, `documentId`, `versionNumber`, `status` (`pending`/`ready`), `fileKey`, `fileName`, `mimeType`, `size`, `sha256?`, `etag?`, `comment?`, `restoredFromVersionId?`, `uploadExpiresAt?` / `newDocument?` (pending direct uploads only), timestamps |
| `dms-activities` | see [Activity log](#activity-log) |

Change this data only through the API. Writing to the collections directly bypasses lock checks, name normalisation and the activity log.

Notes for anyone reading the collections:
- **Root items:** a folder at the root has no `parentId`, and a document at the root has no `folderId` (the field is missing, not `null`).
- **Documents without a version:** a document with no `currentVersionId` exists only for a moment during creation. Listings and search exclude it.
- **Pending uploads:** a version with `status: 'pending'` is an incomplete direct upload, and `listVersions` doesn't return it.
- **Indexes:** these enforce name uniqueness, partial on `trashed: false`. There is also a text index on name, description and tags, prefixed by `workspaceId`.

## Integrating a feature: example

A minimal REST integration in `idreesia-web`. This module only provides the DMS calls; the routes and their auth are yours to write.

```ts
import multer from 'multer';
import {
  getDocumentDownloadUrl,
  uploadDocument,
} from 'meteor/idreesia-common/server/business-logic/dms';

// Keep this in line with the workspace's maxFileSize; multer buffers in memory.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
});

app.post('/api/my-feature/documents', upload.single('file'), async (req, res) => {
  const user = await authenticate(req); // your auth
  const workspaceId = await getWorkspaceIdFor(user, req.body.ownerId); // your access check
  const { document } = await uploadDocument(
    {
      workspaceId,
      folderId: req.body.folderId || null,
      fileName: req.file.originalname,
      body: req.file.buffer,
      mimeType: req.file.mimetype,
    },
    user._id
  );
  res.json({ documentId: document._id });
});

app.get('/api/my-feature/documents/:id/download', async (req, res) => {
  const user = await authenticate(req);
  await assertCanReadDocument(user, req.params.id); // your access check
  const { url } = await getDocumentDownloadUrl(req.params.id, user._id);
  res.redirect(302, url);
});
```

Map errors as described in [Errors](#errors). In a GraphQL resolver, call the DMS directly after your permission check and let its errors propagate.

**Checklist for a new consumer:**
1. Create a DMS workspace for each owning entity, and store its id on that entity.
2. Before every DMS call, check that the user may act on that workspace. If the caller passes a folder or document id, also check that it belongs to the workspace you authorised (`document.workspaceId`).
3. Restrict `forceUnlockDocument`, `purgeFromTrash`, `emptyTrash` and `purgeWorkspace` to privileged users.
4. Use direct uploads for anything that may be large, and make sure the bucket has the CORS rule.
5. Call `purgeExpiredUploads()` periodically if you use direct uploads.

## Limits and constants

All of these are in `idreesia-common/constants/dms.ts`:

| Constant | Value |
|---|---|
| `DMS_DEFAULT_MAX_FILE_SIZE` | 100 MB (per-workspace override: `settings.maxFileSize`) |
| `DMS_UPLOAD_URL_EXPIRY_SECONDS` | 900 |
| `DMS_DOWNLOAD_URL_EXPIRY_SECONDS` | 900 (per-call override: `expiresInSec`) |
| `DMS_DEFAULT_PAGE_SIZE` / `DMS_MAX_PAGE_SIZE` | 50 / 200 |
| `DMS_MAX_NAME_LENGTH` | 255 |
| `DMS_MAX_LOCK_MINUTES` | 10,080 (7 days): the longest a lock can last |
| `DMS_DEFAULT_LOCK_MINUTES` | 10,080 (7 days): used when a check-out names no duration |
| `DMS_LOCK_DURATION_OPTIONS` | The durations the web and mobile check-out offer: 1 hour, 4 hours, 1 day, 3 days, 7 days |
| `DMS_MODULE` | `'dms'`: the module name notifications are keyed by |

## Known limitations

- **Server-side reads and uploads are not streamed.** `uploadDocument`, `uploadNewVersion` and `readDocumentContent` hold the whole file in memory. Use direct uploads and presigned download URLs for large files.
- **Search covers metadata only:** names, descriptions, tags and metadata values. File contents are not indexed.
- **Multi-step operations are not transactional.** Partial failures are cleaned up where possible, e.g. a stored file is deleted when its version can't be recorded. Purges remove the database records before the files, so if a file deletion fails, the result is an orphaned object in storage rather than a record pointing at a missing file.
- **No per-document or per-folder permissions.** The module has no access model, by design.
- **Nothing cleans up expired direct uploads automatically.** See `purgeExpiredUploads()`.
