import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityUserGroupsQuery,
  SecurityUserGroupsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_USER_GROUPS: TypedDocumentNode<SecurityUserGroupsQuery, SecurityUserGroupsQueryVariables> = gql`
  query securityUserGroups {
    securityUserGroups {
      _id
      name
      description
      users {
        userId
        personId
        username
        displayName
      }
    }
  }
`;

export default SECURITY_USER_GROUPS;
