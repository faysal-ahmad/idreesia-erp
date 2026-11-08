import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileMyCommitteesQuery,
  MobileMyCommitteesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

// Committees (workspaces) the signed-in user is a member of; erp-admin gets
// all of them. Same server query as the web's Workspaces sidebar.
export const MOBILE_MY_COMMITTEES: TypedDocumentNode<
  MobileMyCommitteesQuery,
  MobileMyCommitteesQueryVariables
> = gql`
  query mobileMyCommittees {
    myCommittees {
      _id
      name
      description
      features
    }
  }
`;
