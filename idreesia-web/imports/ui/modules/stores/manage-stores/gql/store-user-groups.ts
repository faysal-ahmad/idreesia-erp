import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  StoreUserGroupsQuery,
  StoreUserGroupsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const STORE_USER_GROUPS: TypedDocumentNode<StoreUserGroupsQuery, StoreUserGroupsQueryVariables> = gql`
  query storeUserGroups {
    storeUserGroups {
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

export default STORE_USER_GROUPS;
