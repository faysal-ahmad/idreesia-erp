import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileWorkspaceCommitteeMembersQuery,
  MobileWorkspaceCommitteeMembersQueryVariables,
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
