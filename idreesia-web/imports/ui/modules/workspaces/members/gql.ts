import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  WorkspaceCommitteeMembersQuery,
  WorkspaceCommitteeMembersQueryVariables,
  WorkspaceCommitteeKarkunSearchQuery,
  WorkspaceCommitteeKarkunSearchQueryVariables,
  WorkspaceAddCommitteeMemberMutation,
  WorkspaceAddCommitteeMemberMutationVariables,
  WorkspaceRemoveCommitteeMemberMutation,
  WorkspaceRemoveCommitteeMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const WORKSPACE_COMMITTEE_MEMBERS: TypedDocumentNode<
  WorkspaceCommitteeMembersQuery,
  WorkspaceCommitteeMembersQueryVariables
> = gql`
  query workspaceCommitteeMembers($committeeId: String!) {
    workspaceCommitteeById(committeeId: $committeeId) {
      _id
      canManageMembers
      members {
        karkunId
        isCoordinator
        name
        imageId
        imageThumbnailId
        contactNumber1
        contactNumber2
      }
    }
  }
`;

export const WORKSPACE_COMMITTEE_KARKUN_SEARCH: TypedDocumentNode<
  WorkspaceCommitteeKarkunSearchQuery,
  WorkspaceCommitteeKarkunSearchQueryVariables
> = gql`
  query workspaceCommitteeKarkunSearch(
    $committeeId: String!
    $name: String
    $pageIndex: String
    $pageSize: String
  ) {
    workspaceCommitteeKarkunSearch(
      committeeId: $committeeId
      name: $name
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        name
        parentName
        cnicNumber
        contactNumber1
        imageId
        imageThumbnailId
      }
    }
  }
`;

export const WORKSPACE_ADD_COMMITTEE_MEMBER: TypedDocumentNode<
  WorkspaceAddCommitteeMemberMutation,
  WorkspaceAddCommitteeMemberMutationVariables
> = gql`
  mutation workspaceAddCommitteeMember(
    $committeeId: String!
    $karkunId: String!
  ) {
    workspaceAddCommitteeMember(committeeId: $committeeId, karkunId: $karkunId) {
      _id
    }
  }
`;

export const WORKSPACE_REMOVE_COMMITTEE_MEMBER: TypedDocumentNode<
  WorkspaceRemoveCommitteeMemberMutation,
  WorkspaceRemoveCommitteeMemberMutationVariables
> = gql`
  mutation workspaceRemoveCommitteeMember(
    $committeeId: String!
    $karkunId: String!
  ) {
    workspaceRemoveCommitteeMember(
      committeeId: $committeeId
      karkunId: $karkunId
    ) {
      _id
    }
  }
`;
