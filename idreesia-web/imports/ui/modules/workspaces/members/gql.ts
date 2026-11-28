import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  WorkspaceCommitteeMembersQuery,
  WorkspaceCommitteeMembersQueryVariables,
  PagedWorkspaceCommitteeKarkunsQuery,
  PagedWorkspaceCommitteeKarkunsQueryVariables,
  WorkspaceAddCommitteeMemberMutation,
  WorkspaceAddCommitteeMemberMutationVariables,
  WorkspaceRemoveCommitteeMemberMutation,
  WorkspaceRemoveCommitteeMemberMutationVariables,
  WorkspaceSetCommitteeMemberDiscussionAccessMutation,
  WorkspaceSetCommitteeMemberDiscussionAccessMutationVariables,
  WorkspaceSetCommitteeMemberCoordinatorMutation,
  WorkspaceSetCommitteeMemberCoordinatorMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

export const WORKSPACE_COMMITTEE_MEMBERS: TypedDocumentNode<
  WorkspaceCommitteeMembersQuery,
  WorkspaceCommitteeMembersQueryVariables
> = gql`
  query workspaceCommitteeMembers($committeeId: String!) {
    workspaceCommitteeById(committeeId: $committeeId) {
      _id
      canManageMembers
      features
      memberCount
      guestCount
      observerCount
      members {
        karkunId
        role
        isCoordinator
        name
        imageUrl
        imageThumbnailUrl
        contactNumber1
        contactNumber2
        hasChatAccount
        hasDiscussionAccess
      }
    }
  }
`;

export const PAGED_WORKSPACE_COMMITTEE_KARKUNS: TypedDocumentNode<
  PagedWorkspaceCommitteeKarkunsQuery,
  PagedWorkspaceCommitteeKarkunsQueryVariables
> = gql`
  query pagedWorkspaceCommitteeKarkuns(
    $committeeId: String!
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedWorkspaceCommitteeKarkuns(
      committeeId: $committeeId
      name: $name
      cnicNumber: $cnicNumber
      phoneNumber: $phoneNumber
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        ...PickerPersonFields
      }
    }
  }
  ${PICKER_PERSON_FIELDS}
`;

/** Karkuns a coordinator can add to the committee; pass variables.committeeId. */
export const committeeKarkunSource: PersonSearchSource<PagedWorkspaceCommitteeKarkunsQuery> = {
  query: PAGED_WORKSPACE_COMMITTEE_KARKUNS,
  select: data => data.pagedWorkspaceCommitteeKarkuns,
  description: 'Showing karkuns of Multan.',
};

export const WORKSPACE_ADD_COMMITTEE_MEMBER: TypedDocumentNode<
  WorkspaceAddCommitteeMemberMutation,
  WorkspaceAddCommitteeMemberMutationVariables
> = gql`
  mutation workspaceAddCommitteeMember(
    $committeeId: String!
    $karkunId: String!
    $role: String
  ) {
    workspaceAddCommitteeMember(
      committeeId: $committeeId
      karkunId: $karkunId
      role: $role
    ) {
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

export const WORKSPACE_SET_COMMITTEE_MEMBER_COORDINATOR: TypedDocumentNode<
  WorkspaceSetCommitteeMemberCoordinatorMutation,
  WorkspaceSetCommitteeMemberCoordinatorMutationVariables
> = gql`
  mutation workspaceSetCommitteeMemberCoordinator(
    $committeeId: String!
    $karkunId: String!
    $isCoordinator: Boolean!
  ) {
    workspaceSetCommitteeMemberCoordinator(
      committeeId: $committeeId
      karkunId: $karkunId
      isCoordinator: $isCoordinator
    )
  }
`;
