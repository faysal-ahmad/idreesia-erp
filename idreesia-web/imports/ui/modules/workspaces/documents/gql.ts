import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  WorkspaceAbortDocumentUploadMutation,
  WorkspaceAbortDocumentUploadMutationVariables,
  WorkspaceCheckInDocumentMutation,
  WorkspaceCheckInDocumentMutationVariables,
  WorkspaceCheckOutDocumentMutation,
  WorkspaceCheckOutDocumentMutationVariables,
  WorkspaceCompleteDocumentUploadMutation,
  WorkspaceCompleteDocumentUploadMutationVariables,
  WorkspaceCreateDocumentFolderMutation,
  WorkspaceCreateDocumentFolderMutationVariables,
  WorkspaceCreateDocumentUploadMutation,
  WorkspaceCreateDocumentUploadMutationVariables,
  WorkspaceDeleteDocumentVersionMutation,
  WorkspaceDeleteDocumentVersionMutationVariables,
  WorkspaceDocumentActivityQuery,
  WorkspaceDocumentActivityQueryVariables,
  WorkspaceDocumentByIdQuery,
  WorkspaceDocumentByIdQueryVariables,
  WorkspaceDocumentDownloadUrlMutation,
  WorkspaceDocumentDownloadUrlMutationVariables,
  WorkspaceDocumentFolderContentsQuery,
  WorkspaceDocumentFolderContentsQueryVariables,
  WorkspaceDocumentFoldersQuery,
  WorkspaceDocumentFoldersQueryVariables,
  WorkspaceDocumentSearchQuery,
  WorkspaceDocumentSearchQueryVariables,
  WorkspaceDocumentTrashQuery,
  WorkspaceDocumentTrashQueryVariables,
  WorkspaceDocumentVersionsQuery,
  WorkspaceDocumentVersionsQueryVariables,
  WorkspaceDocumentsInfoQuery,
  WorkspaceDocumentsInfoQueryVariables,
  WorkspaceEmptyDocumentTrashMutation,
  WorkspaceEmptyDocumentTrashMutationVariables,
  WorkspaceForceUnlockDocumentMutation,
  WorkspaceForceUnlockDocumentMutationVariables,
  WorkspaceMoveDocumentFolderMutation,
  WorkspaceMoveDocumentFolderMutationVariables,
  WorkspaceMoveDocumentMutation,
  WorkspaceMoveDocumentMutationVariables,
  WorkspacePurgeDocumentTrashItemMutation,
  WorkspacePurgeDocumentTrashItemMutationVariables,
  WorkspaceRenameDocumentFolderMutation,
  WorkspaceRenameDocumentFolderMutationVariables,
  WorkspaceRestoreDocumentTrashItemMutation,
  WorkspaceRestoreDocumentTrashItemMutationVariables,
  WorkspaceRestoreDocumentVersionMutation,
  WorkspaceRestoreDocumentVersionMutationVariables,
  WorkspaceTrashDocumentFolderMutation,
  WorkspaceTrashDocumentFolderMutationVariables,
  WorkspaceTrashDocumentMutation,
  WorkspaceTrashDocumentMutationVariables,
  WorkspaceUpdateDocumentMutation,
  WorkspaceUpdateDocumentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const FOLDER_FIELDS = gql`
  fragment WorkspaceDocumentFolderFields on WorkspaceDocumentFolderType {
    _id
    name
    parentId
    createdAt
    createdByName
    updatedAt
    updatedByName
    deletedAt
    deletedByName
  }
`;

const DOCUMENT_FIELDS = gql`
  fragment WorkspaceDocumentFields on WorkspaceDocumentType {
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

export const WORKSPACE_DOCUMENTS_INFO: TypedDocumentNode<
  WorkspaceDocumentsInfoQuery,
  WorkspaceDocumentsInfoQueryVariables
> = gql`
  query workspaceDocumentsInfo($committeeId: String!) {
    workspaceDocumentsInfo(committeeId: $committeeId) {
      canManage
      maxFileSize
    }
  }
`;

export const WORKSPACE_DOCUMENT_FOLDER_CONTENTS: TypedDocumentNode<
  WorkspaceDocumentFolderContentsQuery,
  WorkspaceDocumentFolderContentsQueryVariables
> = gql`
  query workspaceDocumentFolderContents(
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
        ...WorkspaceDocumentFolderFields
      }
      folders {
        ...WorkspaceDocumentFolderFields
      }
      documents {
        totalResults
        data {
          ...WorkspaceDocumentFields
        }
      }
    }
  }
  ${FOLDER_FIELDS}
  ${DOCUMENT_FIELDS}
`;

export const WORKSPACE_DOCUMENT_FOLDERS: TypedDocumentNode<
  WorkspaceDocumentFoldersQuery,
  WorkspaceDocumentFoldersQueryVariables
> = gql`
  query workspaceDocumentFolders($committeeId: String!) {
    workspaceDocumentFolders(committeeId: $committeeId) {
      ...WorkspaceDocumentFolderFields
    }
  }
  ${FOLDER_FIELDS}
`;

export const WORKSPACE_DOCUMENT_SEARCH: TypedDocumentNode<
  WorkspaceDocumentSearchQuery,
  WorkspaceDocumentSearchQueryVariables
> = gql`
  query workspaceDocumentSearch(
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
        ...WorkspaceDocumentFields
      }
    }
  }
  ${DOCUMENT_FIELDS}
`;

export const WORKSPACE_DOCUMENT_BY_ID: TypedDocumentNode<
  WorkspaceDocumentByIdQuery,
  WorkspaceDocumentByIdQueryVariables
> = gql`
  query workspaceDocumentById($committeeId: String!, $documentId: String!) {
    workspaceDocumentById(committeeId: $committeeId, documentId: $documentId) {
      ...WorkspaceDocumentFields
    }
  }
  ${DOCUMENT_FIELDS}
`;

export const WORKSPACE_DOCUMENT_VERSIONS: TypedDocumentNode<
  WorkspaceDocumentVersionsQuery,
  WorkspaceDocumentVersionsQueryVariables
> = gql`
  query workspaceDocumentVersions($committeeId: String!, $documentId: String!) {
    workspaceDocumentVersions(
      committeeId: $committeeId
      documentId: $documentId
    ) {
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

export const WORKSPACE_DOCUMENT_ACTIVITY: TypedDocumentNode<
  WorkspaceDocumentActivityQuery,
  WorkspaceDocumentActivityQueryVariables
> = gql`
  query workspaceDocumentActivity(
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
      entityType
      entityId
      documentId
      userName
      at
      details
    }
  }
`;

export const WORKSPACE_DOCUMENT_TRASH: TypedDocumentNode<
  WorkspaceDocumentTrashQuery,
  WorkspaceDocumentTrashQueryVariables
> = gql`
  query workspaceDocumentTrash($committeeId: String!) {
    workspaceDocumentTrash(committeeId: $committeeId) {
      folders {
        ...WorkspaceDocumentFolderFields
      }
      documents {
        ...WorkspaceDocumentFields
      }
    }
  }
  ${FOLDER_FIELDS}
  ${DOCUMENT_FIELDS}
`;

export const WORKSPACE_CREATE_DOCUMENT_FOLDER: TypedDocumentNode<
  WorkspaceCreateDocumentFolderMutation,
  WorkspaceCreateDocumentFolderMutationVariables
> = gql`
  mutation workspaceCreateDocumentFolder(
    $committeeId: String!
    $parentId: String
    $name: String!
  ) {
    workspaceCreateDocumentFolder(
      committeeId: $committeeId
      parentId: $parentId
      name: $name
    )
  }
`;

export const WORKSPACE_RENAME_DOCUMENT_FOLDER: TypedDocumentNode<
  WorkspaceRenameDocumentFolderMutation,
  WorkspaceRenameDocumentFolderMutationVariables
> = gql`
  mutation workspaceRenameDocumentFolder(
    $committeeId: String!
    $folderId: String!
    $name: String!
  ) {
    workspaceRenameDocumentFolder(
      committeeId: $committeeId
      folderId: $folderId
      name: $name
    )
  }
`;

export const WORKSPACE_MOVE_DOCUMENT_FOLDER: TypedDocumentNode<
  WorkspaceMoveDocumentFolderMutation,
  WorkspaceMoveDocumentFolderMutationVariables
> = gql`
  mutation workspaceMoveDocumentFolder(
    $committeeId: String!
    $folderId: String!
    $parentId: String
  ) {
    workspaceMoveDocumentFolder(
      committeeId: $committeeId
      folderId: $folderId
      parentId: $parentId
    )
  }
`;

export const WORKSPACE_TRASH_DOCUMENT_FOLDER: TypedDocumentNode<
  WorkspaceTrashDocumentFolderMutation,
  WorkspaceTrashDocumentFolderMutationVariables
> = gql`
  mutation workspaceTrashDocumentFolder(
    $committeeId: String!
    $folderId: String!
  ) {
    workspaceTrashDocumentFolder(committeeId: $committeeId, folderId: $folderId)
  }
`;

export const WORKSPACE_CREATE_DOCUMENT_UPLOAD: TypedDocumentNode<
  WorkspaceCreateDocumentUploadMutation,
  WorkspaceCreateDocumentUploadMutationVariables
> = gql`
  mutation workspaceCreateDocumentUpload(
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
      documentId
      url
      contentType
      expiresAt
    }
  }
`;

export const WORKSPACE_COMPLETE_DOCUMENT_UPLOAD: TypedDocumentNode<
  WorkspaceCompleteDocumentUploadMutation,
  WorkspaceCompleteDocumentUploadMutationVariables
> = gql`
  mutation workspaceCompleteDocumentUpload(
    $committeeId: String!
    $uploadId: String!
  ) {
    workspaceCompleteDocumentUpload(
      committeeId: $committeeId
      uploadId: $uploadId
    ) {
      ...WorkspaceDocumentFields
    }
  }
  ${DOCUMENT_FIELDS}
`;

export const WORKSPACE_ABORT_DOCUMENT_UPLOAD: TypedDocumentNode<
  WorkspaceAbortDocumentUploadMutation,
  WorkspaceAbortDocumentUploadMutationVariables
> = gql`
  mutation workspaceAbortDocumentUpload(
    $committeeId: String!
    $uploadId: String!
  ) {
    workspaceAbortDocumentUpload(committeeId: $committeeId, uploadId: $uploadId)
  }
`;

export const WORKSPACE_UPDATE_DOCUMENT: TypedDocumentNode<
  WorkspaceUpdateDocumentMutation,
  WorkspaceUpdateDocumentMutationVariables
> = gql`
  mutation workspaceUpdateDocument(
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

export const WORKSPACE_MOVE_DOCUMENT: TypedDocumentNode<
  WorkspaceMoveDocumentMutation,
  WorkspaceMoveDocumentMutationVariables
> = gql`
  mutation workspaceMoveDocument(
    $committeeId: String!
    $documentId: String!
    $folderId: String
  ) {
    workspaceMoveDocument(
      committeeId: $committeeId
      documentId: $documentId
      folderId: $folderId
    )
  }
`;

export const WORKSPACE_TRASH_DOCUMENT: TypedDocumentNode<
  WorkspaceTrashDocumentMutation,
  WorkspaceTrashDocumentMutationVariables
> = gql`
  mutation workspaceTrashDocument($committeeId: String!, $documentId: String!) {
    workspaceTrashDocument(committeeId: $committeeId, documentId: $documentId)
  }
`;

export const WORKSPACE_DOCUMENT_DOWNLOAD_URL: TypedDocumentNode<
  WorkspaceDocumentDownloadUrlMutation,
  WorkspaceDocumentDownloadUrlMutationVariables
> = gql`
  mutation workspaceDocumentDownloadUrl(
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

export const WORKSPACE_RESTORE_DOCUMENT_VERSION: TypedDocumentNode<
  WorkspaceRestoreDocumentVersionMutation,
  WorkspaceRestoreDocumentVersionMutationVariables
> = gql`
  mutation workspaceRestoreDocumentVersion(
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

export const WORKSPACE_DELETE_DOCUMENT_VERSION: TypedDocumentNode<
  WorkspaceDeleteDocumentVersionMutation,
  WorkspaceDeleteDocumentVersionMutationVariables
> = gql`
  mutation workspaceDeleteDocumentVersion(
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

export const WORKSPACE_CHECK_OUT_DOCUMENT: TypedDocumentNode<
  WorkspaceCheckOutDocumentMutation,
  WorkspaceCheckOutDocumentMutationVariables
> = gql`
  mutation workspaceCheckOutDocument(
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

export const WORKSPACE_CHECK_IN_DOCUMENT: TypedDocumentNode<
  WorkspaceCheckInDocumentMutation,
  WorkspaceCheckInDocumentMutationVariables
> = gql`
  mutation workspaceCheckInDocument(
    $committeeId: String!
    $documentId: String!
  ) {
    workspaceCheckInDocument(committeeId: $committeeId, documentId: $documentId)
  }
`;

export const WORKSPACE_FORCE_UNLOCK_DOCUMENT: TypedDocumentNode<
  WorkspaceForceUnlockDocumentMutation,
  WorkspaceForceUnlockDocumentMutationVariables
> = gql`
  mutation workspaceForceUnlockDocument(
    $committeeId: String!
    $documentId: String!
  ) {
    workspaceForceUnlockDocument(
      committeeId: $committeeId
      documentId: $documentId
    )
  }
`;

export const WORKSPACE_RESTORE_DOCUMENT_TRASH_ITEM: TypedDocumentNode<
  WorkspaceRestoreDocumentTrashItemMutation,
  WorkspaceRestoreDocumentTrashItemMutationVariables
> = gql`
  mutation workspaceRestoreDocumentTrashItem(
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

export const WORKSPACE_PURGE_DOCUMENT_TRASH_ITEM: TypedDocumentNode<
  WorkspacePurgeDocumentTrashItemMutation,
  WorkspacePurgeDocumentTrashItemMutationVariables
> = gql`
  mutation workspacePurgeDocumentTrashItem(
    $committeeId: String!
    $itemId: String!
  ) {
    workspacePurgeDocumentTrashItem(committeeId: $committeeId, itemId: $itemId)
  }
`;

export const WORKSPACE_EMPTY_DOCUMENT_TRASH: TypedDocumentNode<
  WorkspaceEmptyDocumentTrashMutation,
  WorkspaceEmptyDocumentTrashMutationVariables
> = gql`
  mutation workspaceEmptyDocumentTrash($committeeId: String!) {
    workspaceEmptyDocumentTrash(committeeId: $committeeId)
  }
`;
