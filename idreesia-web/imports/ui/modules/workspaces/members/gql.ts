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
  WorkspaceSetCommitteeMemberDiscussionAccessMutation,
  WorkspaceSetCommitteeMemberDiscussionAccessMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const WORKSPACE_COMMITTEE_MEMBERS: TypedDocumentNode<
  WorkspaceCommitteeMembersQuery,
  WorkspaceCommitteeMembersQueryVariables
> = gql`
  query workspaceCommitteeMembers($committeeId: String!) {
    workspaceCommitteeById(committeeId: $committeeId) {
      _id
      canManageMembers
      features
      members {
        karkunId
        isCoordinator
        name
        imageId
        imageThumbnailId
        contactNumber1
        contactNumber2
        hasChatAccount
        hasDiscussionAccess
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
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    workspaceCommitteeKarkunSearch(
      committeeId: $committeeId
      name: $name
      cnicNumber: $cnicNumber
      phoneNumber: $phoneNumber
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

export const WORKSPACE_SET_COMMITTEE_MEMBER_DISCUSSION_ACCESS: TypedDocumentNode<
  WorkspaceSetCommitteeMemberDiscussionAccessMutation,
  WorkspaceSetCommitteeMemberDiscussionAccessMutationVariables
> = gql`
  mutation workspaceSetCommitteeMemberDiscussionAccess(
    $committeeId: String!
    $karkunId: String!
    $hasAccess: Boolean!
  ) {
    workspaceSetCommitteeMemberDiscussionAccess(
      committeeId: $committeeId
      karkunId: $karkunId
      hasAccess: $hasAccess
    )
  }
`;
