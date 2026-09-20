import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityLogUsersQuery,
  SecurityLogUsersQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_LOG_USERS: TypedDocumentNode<
  SecurityLogUsersQuery,
  SecurityLogUsersQueryVariables
> = gql`
  query securityLogUsers($search: String, $ids: [String!]) {
    securityLogUsers(search: $search, ids: $ids) {
      _id
      name
    }
  }
`;

export default SECURITY_LOG_USERS;
