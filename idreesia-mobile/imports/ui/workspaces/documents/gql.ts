import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileWorkspaceAbortDocumentUploadMutation,
  MobileWorkspaceAbortDocumentUploadMutationVariables,
  MobileWorkspaceCheckInDocumentMutation,
  MobileWorkspaceCheckInDocumentMutationVariables,
  MobileWorkspaceCheckOutDocumentMutation,
  MobileWorkspaceCheckOutDocumentMutationVariables,
  MobileWorkspaceCompleteDocumentUploadMutation,
  MobileWorkspaceCompleteDocumentUploadMutationVariables,
  MobileWorkspaceCreateDocumentFolderMutation,
  MobileWorkspaceCreateDocumentFolderMutationVariables,
  MobileWorkspaceCreateDocumentUploadMutation,
  MobileWorkspaceCreateDocumentUploadMutationVariables,
  MobileWorkspaceDeleteDocumentVersionMutation,
  MobileWorkspaceDeleteDocumentVersionMutationVariables,
  MobileWorkspaceDocumentActivityQuery,
  MobileWorkspaceDocumentActivityQueryVariables,
  MobileWorkspaceDocumentByIdQuery,
  MobileWorkspaceDocumentByIdQueryVariables,
  MobileWorkspaceDocumentDownloadUrlMutation,
  MobileWorkspaceDocumentDownloadUrlMutationVariables,
  MobileWorkspaceDocumentFolderContentsQuery,
  MobileWorkspaceDocumentFolderContentsQueryVariables,
  MobileWorkspaceDocumentFoldersQuery,
  MobileWorkspaceDocumentFoldersQueryVariables,
  MobileWorkspaceDocumentSearchQuery,
  MobileWorkspaceDocumentSearchQueryVariables,
  MobileWorkspaceDocumentTrashQuery,
  MobileWorkspaceDocumentTrashQueryVariables,
  MobileWorkspaceDocumentVersionsQuery,
  MobileWorkspaceDocumentVersionsQueryVariables,
  MobileWorkspaceDocumentsInfoQuery,
  MobileWorkspaceDocumentsInfoQueryVariables,
  MobileWorkspaceEmptyDocumentTrashMutation,
  MobileWorkspaceEmptyDocumentTrashMutationVariables,
  MobileWorkspaceForceUnlockDocumentMutation,
  MobileWorkspaceForceUnlockDocumentMutationVariables,
  MobileWorkspaceMoveDocumentFolderMutation,
  MobileWorkspaceMoveDocumentFolderMutationVariables,
  MobileWorkspaceMoveDocumentMutation,
  MobileWorkspaceMoveDocumentMutationVariables,
  MobileWorkspacePurgeDocumentTrashItemMutation,
  MobileWorkspacePurgeDocumentTrashItemMutationVariables,
  MobileWorkspaceRenameDocumentFolderMutation,
  MobileWorkspaceRenameDocumentFolderMutationVariables,
  MobileWorkspaceRestoreDocumentTrashItemMutation,
  MobileWorkspaceRestoreDocumentTrashItemMutationVariables,
  MobileWorkspaceRestoreDocumentVersionMutation,
  MobileWorkspaceRestoreDocumentVersionMutationVariables,
  MobileWorkspaceTrashDocumentFolderMutation,
  MobileWorkspaceTrashDocumentFolderMutationVariables,
  MobileWorkspaceTrashDocumentMutation,
  MobileWorkspaceTrashDocumentMutationVariables,
  MobileWorkspaceUpdateDocumentMutation,
  MobileWorkspaceUpdateDocumentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

// Workspace → Documents: a committee's document library (the DMS), as on the
// web's Workspaces → Documents.

export const MOBILE_WORKSPACE_DOCUMENT_FOLDER_FIELDS = gql`
  fragment MobileWorkspaceDocumentFolderFields on WorkspaceDocumentFolderType {
    _id
    name
    parentId
    updatedAt
    updatedByName
    deletedAt
    deletedByName
  }
`;

export const MOBILE_WORKSPACE_DOCUMENT_FIELDS = gql`
  fragment MobileWorkspaceDocumentFields on WorkspaceDocumentType {
    _id
    name
    folderId
    folderName
    description
    tags
    fileName
    mimeType
    size
    currentVersionNumber
    lock {
      userName
      lockedAt
      expiresAt
      note
      isMine
    }
    createdAt
    createdByName
    updatedAt
    updatedByName
    deletedAt
    deletedByName
  }
`;

/** Whether the user is a coordinator, and the upload limit. */
export const MOBILE_WORKSPACE_DOCUMENTS_INFO: TypedDocumentNode<
  MobileWorkspaceDocumentsInfoQuery,
  MobileWorkspaceDocumentsInfoQueryVariables
> = gql`
  query mobileWorkspaceDocumentsInfo($committeeId: String!) {
    workspaceDocumentsInfo(committeeId: $committeeId) {
      canManage
      maxFileSize
    }
  }
`;

/** A folder (null = the top level): its path, subfolders and a page of documents. */
export const MOBILE_WORKSPACE_DOCUMENT_FOLDER_CONTENTS: TypedDocumentNode<
  MobileWorkspaceDocumentFolderContentsQuery,
  MobileWorkspaceDocumentFolderContentsQueryVariables
> = gql`
  query mobileWorkspaceDocumentFolderContents(
    $committeeId: String!
    $folderId: String
    $pageIndex: Int
    $pageSize: Int
  ) {
    workspaceDocumentFolderContents(
      committeeId: $committeeId
      folderId: $folderId
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      path {
        ...MobileWorkspaceDocumentFolderFields
      }
      folders {
        ...MobileWorkspaceDocumentFolderFields
      }
      documents {
        totalResults
        data {
          ...MobileWorkspaceDocumentFields
        }
      }
    }
  }
  ${MOBILE_WORKSPACE_DOCUMENT_FOLDER_FIELDS}
  ${MOBILE_WORKSPACE_DOCUMENT_FIELDS}
`;

/** Every folder, for picking where to move something. */
export const MOBILE_WORKSPACE_DOCUMENT_FOLDERS: TypedDocumentNode<
  MobileWorkspaceDocumentFoldersQuery,
  MobileWorkspaceDocumentFoldersQueryVariables
> = gql`
  query mobileWorkspaceDocumentFolders($committeeId: String!) {
    workspaceDocumentFolders(committeeId: $committeeId) {
      ...MobileWorkspaceDocumentFolderFields
    }
  }
  ${MOBILE_WORKSPACE_DOCUMENT_FOLDER_FIELDS}
`;

/** Documents anywhere in the library whose name, description or tags match. */
export const MOBILE_WORKSPACE_DOCUMENT_SEARCH: TypedDocumentNode<
  MobileWorkspaceDocumentSearchQuery,
  MobileWorkspaceDocumentSearchQueryVariables
> = gql`
  query mobileWorkspaceDocumentSearch(
    $committeeId: String!
    $text: String!
    $pageIndex: Int
    $pageSize: Int
  ) {
    workspaceDocumentSearch(
      committeeId: $committeeId
      text: $text
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        ...MobileWorkspaceDocumentFields
      }
    }
  }
  ${MOBILE_WORKSPACE_DOCUMENT_FIELDS}
`;

export const MOBILE_WORKSPACE_DOCUMENT_BY_ID: TypedDocumentNode<
  MobileWorkspaceDocumentByIdQuery,
  MobileWorkspaceDocumentByIdQueryVariables
> = gql`
  query mobileWorkspaceDocumentById($committeeId: String!, $documentId: String!) {
    workspaceDocumentById(committeeId: $committeeId, documentId: $documentId) {
      ...MobileWorkspaceDocumentFields
    }
  }
  ${MOBILE_WORKSPACE_DOCUMENT_FIELDS}
`;

export const MOBILE_WORKSPACE_DOCUMENT_VERSIONS: TypedDocumentNode<
  MobileWorkspaceDocumentVersionsQuery,
  MobileWorkspaceDocumentVersionsQueryVariables
> = gql`
  query mobileWorkspaceDocumentVersions($committeeId: String!, $documentId: String!) {
    workspaceDocumentVersions(committeeId: $committeeId, documentId: $documentId) {
      _id
      versionNumber
      fileName
      mimeType
      size
      comment
      isCurrent
      createdAt
      createdByName
    }
  }
`;

/** Newest first; pass the last entry's `at` as `before` for older entries. */
export const MOBILE_WORKSPACE_DOCUMENT_ACTIVITY: TypedDocumentNode<
  MobileWorkspaceDocumentActivityQuery,
  MobileWorkspaceDocumentActivityQueryVariables
> = gql`
  query mobileWorkspaceDocumentActivity(
    $committeeId: String!
    $documentId: String
    $before: String
    $limit: Int
  ) {
    workspaceDocumentActivity(
      committeeId: $committeeId
      documentId: $documentId
      before: $before
      limit: $limit
    ) {
      _id
      action
      userName
      at
      details
    }
  }
`;

export const MOBILE_WORKSPACE_DOCUMENT_TRASH: TypedDocumentNode<
  MobileWorkspaceDocumentTrashQuery,
  MobileWorkspaceDocumentTrashQueryVariables
> = gql`
  query mobileWorkspaceDocumentTrash($committeeId: String!) {
    workspaceDocumentTrash(committeeId: $committeeId) {
      folders {
        ...MobileWorkspaceDocumentFolderFields
      }
      documents {
        ...MobileWorkspaceDocumentFields
      }
    }
  }
  ${MOBILE_WORKSPACE_DOCUMENT_FOLDER_FIELDS}
  ${MOBILE_WORKSPACE_DOCUMENT_FIELDS}
`;

// --- Folders -----------------------------------------------------------------

export const MOBILE_WORKSPACE_CREATE_DOCUMENT_FOLDER: TypedDocumentNode<
  MobileWorkspaceCreateDocumentFolderMutation,
  MobileWorkspaceCreateDocumentFolderMutationVariables
> = gql`
  mutation mobileWorkspaceCreateDocumentFolder(
    $committeeId: String!
    $parentId: String
    $name: String!
  ) {
    workspaceCreateDocumentFolder(committeeId: $committeeId, parentId: $parentId, name: $name)
  }
`;

export const MOBILE_WORKSPACE_RENAME_DOCUMENT_FOLDER: TypedDocumentNode<
  MobileWorkspaceRenameDocumentFolderMutation,
  MobileWorkspaceRenameDocumentFolderMutationVariables
> = gql`
  mutation mobileWorkspaceRenameDocumentFolder(
    $committeeId: String!
    $folderId: String!
    $name: String!
  ) {
    workspaceRenameDocumentFolder(committeeId: $committeeId, folderId: $folderId, name: $name)
  }
`;

export const MOBILE_WORKSPACE_MOVE_DOCUMENT_FOLDER: TypedDocumentNode<
  MobileWorkspaceMoveDocumentFolderMutation,
  MobileWorkspaceMoveDocumentFolderMutationVariables
> = gql`
  mutation mobileWorkspaceMoveDocumentFolder(
    $committeeId: String!
    $folderId: String!
    $parentId: String
  ) {
    workspaceMoveDocumentFolder(committeeId: $committeeId, folderId: $folderId, parentId: $parentId)
  }
`;

export const MOBILE_WORKSPACE_TRASH_DOCUMENT_FOLDER: TypedDocumentNode<
  MobileWorkspaceTrashDocumentFolderMutation,
  MobileWorkspaceTrashDocumentFolderMutationVariables
> = gql`
  mutation mobileWorkspaceTrashDocumentFolder($committeeId: String!, $folderId: String!) {
    workspaceTrashDocumentFolder(committeeId: $committeeId, folderId: $folderId)
  }
`;

// --- Uploads -----------------------------------------------------------------

/** A new document in `folderId`, or a new version of `documentId`. */
export const MOBILE_WORKSPACE_CREATE_DOCUMENT_UPLOAD: TypedDocumentNode<
  MobileWorkspaceCreateDocumentUploadMutation,
  MobileWorkspaceCreateDocumentUploadMutationVariables
> = gql`
  mutation mobileWorkspaceCreateDocumentUpload(
    $committeeId: String!
    $folderId: String
    $documentId: String
    $fileName: String!
    $mimeType: String
    $size: Float!
    $comment: String
  ) {
    workspaceCreateDocumentUpload(
      committeeId: $committeeId
      folderId: $folderId
      documentId: $documentId
      fileName: $fileName
      mimeType: $mimeType
      size: $size
      comment: $comment
    ) {
      uploadId
      url
      contentType
    }
  }
`;

export const MOBILE_WORKSPACE_COMPLETE_DOCUMENT_UPLOAD: TypedDocumentNode<
  MobileWorkspaceCompleteDocumentUploadMutation,
  MobileWorkspaceCompleteDocumentUploadMutationVariables
> = gql`
  mutation mobileWorkspaceCompleteDocumentUpload($committeeId: String!, $uploadId: String!) {
    workspaceCompleteDocumentUpload(committeeId: $committeeId, uploadId: $uploadId) {
      ...MobileWorkspaceDocumentFields
    }
  }
  ${MOBILE_WORKSPACE_DOCUMENT_FIELDS}
`;

export const MOBILE_WORKSPACE_ABORT_DOCUMENT_UPLOAD: TypedDocumentNode<
  MobileWorkspaceAbortDocumentUploadMutation,
  MobileWorkspaceAbortDocumentUploadMutationVariables
> = gql`
  mutation mobileWorkspaceAbortDocumentUpload($committeeId: String!, $uploadId: String!) {
    workspaceAbortDocumentUpload(committeeId: $committeeId, uploadId: $uploadId)
  }
`;

// --- Documents ---------------------------------------------------------------

export const MOBILE_WORKSPACE_UPDATE_DOCUMENT: TypedDocumentNode<
  MobileWorkspaceUpdateDocumentMutation,
  MobileWorkspaceUpdateDocumentMutationVariables
> = gql`
  mutation mobileWorkspaceUpdateDocument(
    $committeeId: String!
    $documentId: String!
    $name: String!
    $description: String
    $tags: [String]
  ) {
    workspaceUpdateDocument(
      committeeId: $committeeId
      documentId: $documentId
      name: $name
      description: $description
      tags: $tags
    )
  }
`;

export const MOBILE_WORKSPACE_MOVE_DOCUMENT: TypedDocumentNode<
  MobileWorkspaceMoveDocumentMutation,
  MobileWorkspaceMoveDocumentMutationVariables
> = gql`
  mutation mobileWorkspaceMoveDocument(
    $committeeId: String!
    $documentId: String!
    $folderId: String
  ) {
    workspaceMoveDocument(committeeId: $committeeId, documentId: $documentId, folderId: $folderId)
  }
`;

export const MOBILE_WORKSPACE_TRASH_DOCUMENT: TypedDocumentNode<
  MobileWorkspaceTrashDocumentMutation,
  MobileWorkspaceTrashDocumentMutationVariables
> = gql`
  mutation mobileWorkspaceTrashDocument($committeeId: String!, $documentId: String!) {
    workspaceTrashDocument(committeeId: $committeeId, documentId: $documentId)
  }
`;

/** A short-lived link to a version (default: the current one); recorded in the activity. */
export const MOBILE_WORKSPACE_DOCUMENT_DOWNLOAD_URL: TypedDocumentNode<
  MobileWorkspaceDocumentDownloadUrlMutation,
  MobileWorkspaceDocumentDownloadUrlMutationVariables
> = gql`
  mutation mobileWorkspaceDocumentDownloadUrl(
    $committeeId: String!
    $documentId: String!
    $versionId: String
    $inline: Boolean
  ) {
    workspaceDocumentDownloadUrl(
      committeeId: $committeeId
      documentId: $documentId
      versionId: $versionId
      inline: $inline
    ) {
      url
      fileName
    }
  }
`;

export const MOBILE_WORKSPACE_RESTORE_DOCUMENT_VERSION: TypedDocumentNode<
  MobileWorkspaceRestoreDocumentVersionMutation,
  MobileWorkspaceRestoreDocumentVersionMutationVariables
> = gql`
  mutation mobileWorkspaceRestoreDocumentVersion(
    $committeeId: String!
    $documentId: String!
    $versionId: String!
  ) {
    workspaceRestoreDocumentVersion(
      committeeId: $committeeId
      documentId: $documentId
      versionId: $versionId
    )
  }
`;

export const MOBILE_WORKSPACE_DELETE_DOCUMENT_VERSION: TypedDocumentNode<
  MobileWorkspaceDeleteDocumentVersionMutation,
  MobileWorkspaceDeleteDocumentVersionMutationVariables
> = gql`
  mutation mobileWorkspaceDeleteDocumentVersion(
    $committeeId: String!
    $documentId: String!
    $versionId: String!
  ) {
    workspaceDeleteDocumentVersion(
      committeeId: $committeeId
      documentId: $documentId
      versionId: $versionId
    )
  }
`;

export const MOBILE_WORKSPACE_CHECK_OUT_DOCUMENT: TypedDocumentNode<
  MobileWorkspaceCheckOutDocumentMutation,
  MobileWorkspaceCheckOutDocumentMutationVariables
> = gql`
  mutation mobileWorkspaceCheckOutDocument(
    $committeeId: String!
    $documentId: String!
    $durationMinutes: Int!
    $note: String
  ) {
    workspaceCheckOutDocument(
      committeeId: $committeeId
      documentId: $documentId
      durationMinutes: $durationMinutes
      note: $note
    )
  }
`;

export const MOBILE_WORKSPACE_CHECK_IN_DOCUMENT: TypedDocumentNode<
  MobileWorkspaceCheckInDocumentMutation,
  MobileWorkspaceCheckInDocumentMutationVariables
> = gql`
  mutation mobileWorkspaceCheckInDocument($committeeId: String!, $documentId: String!) {
    workspaceCheckInDocument(committeeId: $committeeId, documentId: $documentId)
  }
`;

export const MOBILE_WORKSPACE_FORCE_UNLOCK_DOCUMENT: TypedDocumentNode<
  MobileWorkspaceForceUnlockDocumentMutation,
  MobileWorkspaceForceUnlockDocumentMutationVariables
> = gql`
  mutation mobileWorkspaceForceUnlockDocument($committeeId: String!, $documentId: String!) {
    workspaceForceUnlockDocument(committeeId: $committeeId, documentId: $documentId)
  }
`;

// --- Trash -------------------------------------------------------------------

/** With `toRoot`, at the top level instead of its old folder; under `newName` if given. */
export const MOBILE_WORKSPACE_RESTORE_DOCUMENT_TRASH_ITEM: TypedDocumentNode<
  MobileWorkspaceRestoreDocumentTrashItemMutation,
  MobileWorkspaceRestoreDocumentTrashItemMutationVariables
> = gql`
  mutation mobileWorkspaceRestoreDocumentTrashItem(
    $committeeId: String!
    $itemId: String!
    $newName: String
    $toRoot: Boolean
  ) {
    workspaceRestoreDocumentTrashItem(
      committeeId: $committeeId
      itemId: $itemId
      newName: $newName
      toRoot: $toRoot
    )
  }
`;

export const MOBILE_WORKSPACE_PURGE_DOCUMENT_TRASH_ITEM: TypedDocumentNode<
  MobileWorkspacePurgeDocumentTrashItemMutation,
  MobileWorkspacePurgeDocumentTrashItemMutationVariables
> = gql`
  mutation mobileWorkspacePurgeDocumentTrashItem($committeeId: String!, $itemId: String!) {
    workspacePurgeDocumentTrashItem(committeeId: $committeeId, itemId: $itemId)
  }
`;

export const MOBILE_WORKSPACE_EMPTY_DOCUMENT_TRASH: TypedDocumentNode<
  MobileWorkspaceEmptyDocumentTrashMutation,
  MobileWorkspaceEmptyDocumentTrashMutationVariables
> = gql`
  mutation mobileWorkspaceEmptyDocumentTrash($committeeId: String!) {
    workspaceEmptyDocumentTrash(committeeId: $committeeId)
  }
`;
