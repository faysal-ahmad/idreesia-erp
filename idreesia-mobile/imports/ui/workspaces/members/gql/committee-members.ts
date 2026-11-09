import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileWorkspaceCommitteeMembersQuery,
  MobileWorkspaceCommitteeMembersQueryVariables,
  MobileSetCommitteeMemberCoordinatorMutation,
  MobileSetCommitteeMemberCoordinatorMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

// Null when the signed-in user isn't a member of the committee.
export const MOBILE_WORKSPACE_COMMITTEE_MEMBERS: TypedDocumentNode<
  MobileWorkspaceCommitteeMembersQuery,
  MobileWorkspaceCommitteeMembersQueryVariables
> = gql`
  query mobileWorkspaceCommitteeMembers($committeeId: String!) {
    workspaceCommitteeById(committeeId: $committeeId) {
      _id
      name
      canManageMembers
      members {
        karkunId
        isCoordinator
        name
        imageUrl
        imageThumbnailUrl
        contactNumber1
        contactNumber2
      }
    }
  }
`;

// Coordinators only. The last coordinator can't be demoted.
export const MOBILE_SET_COMMITTEE_MEMBER_COORDINATOR: TypedDocumentNode<
  MobileSetCommitteeMemberCoordinatorMutation,
  MobileSetCommitteeMemberCoordinatorMutationVariables
> = gql`
  mutation mobileSetCommitteeMemberCoordinator(
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
