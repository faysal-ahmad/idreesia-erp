import { Migrations } from 'meteor/quave:migrations';

import {
  DmsActivities,
  DmsDocuments,
  DmsDocumentVersions,
  DmsFolders,
} from 'meteor/idreesia-common/server/collections/dms';

Migrations.add({
  version: 60,
  async up() {
    // Names are unique (case-insensitively) among the live items of a folder;
    // trashed items don't count. A missing parentId/folderId is the root.
    const folders = DmsFolders.rawCollection();
    await folders.createIndex(
      { workspaceId: 1, parentId: 1, nameLower: 1 },
      {
        unique: true,
        partialFilterExpression: { trashed: false },
        background: true,
      }
    );
    await folders.createIndex({ ancestorIds: 1 }, { background: true });
    await folders.createIndex(
      { trashRootId: 1 },
      { sparse: true, background: true }
    );

    const documents = DmsDocuments.rawCollection();
    await documents.createIndex(
      { workspaceId: 1, folderId: 1, nameLower: 1 },
      {
        unique: true,
        partialFilterExpression: { trashed: false },
        background: true,
      }
    );
    await documents.createIndex(
      { workspaceId: 1, trashed: 1, updatedAt: -1 },
      { background: true }
    );
    await documents.createIndex(
      { workspaceId: 1, tags: 1 },
      { background: true }
    );
    await documents.createIndex(
      { trashRootId: 1 },
      { sparse: true, background: true }
    );
    // Searches always name the workspace, so it prefixes the text index.
    await documents.createIndex(
      { workspaceId: 1, name: 'text', description: 'text', tags: 'text' },
      {
        name: 'dms_documents_text',
        weights: { name: 10, tags: 5, description: 1 },
        // Names mix languages; don't apply English stemming or stop words.
        default_language: 'none',
        background: true,
      }
    );

    const versions = DmsDocumentVersions.rawCollection();
    await versions.createIndex(
      { documentId: 1, versionNumber: 1 },
      {
        unique: true,
        partialFilterExpression: { status: 'ready' },
        background: true,
      }
    );
    await versions.createIndex({ workspaceId: 1 }, { background: true });
    await versions.createIndex(
      { status: 1, uploadExpiresAt: 1 },
      { background: true }
    );

    const activities = DmsActivities.rawCollection();
    await activities.createIndex(
      { workspaceId: 1, at: -1 },
      { background: true }
    );
    await activities.createIndex(
      { documentId: 1, at: -1 },
      { sparse: true, background: true }
    );
  },
});
