import gql from 'graphql-tag';

// A committee's document library in the Workspaces module (Documents
// feature), backed by the DMS. Timestamps are milliseconds as strings.
export default gql`
  type WorkspaceDocumentsInfoType {
    # The logged-in user is a coordinator: can purge, empty the trash, delete
    # versions and force-unlock.
    canManage: Boolean
    # Largest file, in bytes, that can be uploaded.
    maxFileSize: Float
  }

  type WorkspaceDocumentFolderType {
    _id: String
    name: String
    parentId: String
    createdAt: String
    createdByName: String
    updatedAt: String
    updatedByName: String
    deletedAt: String
    deletedByName: String
  }

  type WorkspaceDocumentLockType {
    userName: String
    lockedAt: String
    expiresAt: String
    note: String
    # Checked out by the logged-in user.
    isMine: Boolean
  }

  type WorkspaceDocumentType {
    _id: String
    name: String
    folderId: String
    # Search results only.
    folderName: String
    description: String
    tags: [String]
    fileName: String
    mimeType: String
    size: Float
    currentVersionNumber: Int
    # Set while the document is checked out.
    lock: WorkspaceDocumentLockType
    createdAt: String
    createdByName: String
    updatedAt: String
    updatedByName: String
    deletedAt: String
    deletedByName: String
  }

  type PagedWorkspaceDocumentType {
    data: [WorkspaceDocumentType]
    totalResults: Int
  }

  type WorkspaceDocumentFolderContentsType {
    # The folders from the root down to this one (empty for the root).
    path: [WorkspaceDocumentFolderType]
    folders: [WorkspaceDocumentFolderType]
    documents: PagedWorkspaceDocumentType
  }

  type WorkspaceDocumentVersionType {
    _id: String
    versionNumber: Int
    fileName: String
    mimeType: String
    size: Float
    comment: String
    isCurrent: Boolean
    createdAt: String
    createdByName: String
  }

  type WorkspaceDocumentActivityType {
    _id: String
    # A DmsAction, e.g. 'document-created'.
    action: String
    entityType: String
    entityId: String
    documentId: String
    userName: String
    at: String
    # JSON object with action-specific details.
    details: String
  }

  type WorkspaceDocumentTrashType {
    folders: [WorkspaceDocumentFolderType]
    documents: [WorkspaceDocumentType]
  }

  type WorkspaceDocumentUploadType {
    uploadId: String
    documentId: String
    # PUT the file here with the Content-Type header below.
    url: String
    contentType: String
    expiresAt: String
  }

  type WorkspaceDocumentDownloadType {
    url: String
    fileName: String
  }

  extend type Query {
    workspaceDocumentsInfo(committeeId: String!): WorkspaceDocumentsInfoType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
    # A folder (null = root): its path, subfolders and a page of documents.
    workspaceDocumentFolderContents(
      committeeId: String!
      folderId: String
      pageIndex: Int
      pageSize: Int
    ): WorkspaceDocumentFolderContentsType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
    # Every folder, e.g. for picking where to move something.
    workspaceDocumentFolders(
      committeeId: String!
    ): [WorkspaceDocumentFolderType]
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
    # Documents whose name, description or tags match the words.
    workspaceDocumentSearch(
      committeeId: String!
      text: String!
      pageIndex: Int
      pageSize: Int
    ): PagedWorkspaceDocumentType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
    workspaceDocumentById(
      committeeId: String!
      documentId: String!
    ): WorkspaceDocumentType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
    workspaceDocumentVersions(
      committeeId: String!
      documentId: String!
    ): [WorkspaceDocumentVersionType]
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
    # Newest first; pass the last entry's 'at' as 'before' for the next page.
    workspaceDocumentActivity(
      committeeId: String!
      documentId: String
      before: String
      limit: Int
    ): [WorkspaceDocumentActivityType]
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
    workspaceDocumentTrash(committeeId: String!): WorkspaceDocumentTrashType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])
  }

  extend type Mutation {
    workspaceCreateDocumentFolder(
      committeeId: String!
      parentId: String
      name: String!
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
    workspaceRenameDocumentFolder(
      committeeId: String!
      folderId: String!
      name: String!
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
    workspaceMoveDocumentFolder(
      committeeId: String!
      folderId: String!
      parentId: String
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
    workspaceTrashDocumentFolder(
      committeeId: String!
      folderId: String!
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])

    # Starts a direct upload: a new document in folderId, or a new version of
    # documentId. Then PUT the file to the URL and call
    # workspaceCompleteDocumentUpload.
    workspaceCreateDocumentUpload(
      committeeId: String!
      folderId: String
      documentId: String
      fileName: String!
      mimeType: String
      size: Float!
      comment: String
    ): WorkspaceDocumentUploadType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
    workspaceCompleteDocumentUpload(
      committeeId: String!
      uploadId: String!
    ): WorkspaceDocumentType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
    workspaceAbortDocumentUpload(
      committeeId: String!
      uploadId: String!
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])

    workspaceUpdateDocument(
      committeeId: String!
      documentId: String!
      name: String!
      description: String
      tags: [String]
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
    workspaceMoveDocument(
      committeeId: String!
      documentId: String!
      folderId: String
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
    workspaceTrashDocument(committeeId: String!, documentId: String!): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
    # A short-lived link to a version (default: current). A mutation because
    # each download is recorded in the activity log.
    workspaceDocumentDownloadUrl(
      committeeId: String!
      documentId: String!
      versionId: String
      inline: Boolean
    ): WorkspaceDocumentDownloadType
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER, OBSERVER])

    workspaceRestoreDocumentVersion(
      committeeId: String!
      documentId: String!
      versionId: String!
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
    # Coordinators only.
    workspaceDeleteDocumentVersion(
      committeeId: String!
      documentId: String!
      versionId: String!
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR])

    # The lock lasts durationMinutes, at most 7 days (10080).
    workspaceCheckOutDocument(
      committeeId: String!
      documentId: String!
      durationMinutes: Int!
      note: String
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
    workspaceCheckInDocument(committeeId: String!, documentId: String!): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
    # Coordinators only.
    workspaceForceUnlockDocument(
      committeeId: String!
      documentId: String!
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR])

    # Restores a trashed folder or document, under newName if given; with
    # toRoot, at the top level instead of its original folder.
    workspaceRestoreDocumentTrashItem(
      committeeId: String!
      itemId: String!
      newName: String
      toRoot: Boolean
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR, MEMBER])
    # Coordinators only.
    workspacePurgeDocumentTrashItem(
      committeeId: String!
      itemId: String!
    ): Boolean
      @checkCommitteeAccess(roles: [COORDINATOR])
    # Coordinators only. Returns how many items were purged.
    workspaceEmptyDocumentTrash(committeeId: String!): Int
      @checkCommitteeAccess(roles: [COORDINATOR])
  }
`;
