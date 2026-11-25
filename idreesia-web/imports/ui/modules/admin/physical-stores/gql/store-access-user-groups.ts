import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  StoreAccessUserGroupsQuery,
  StoreAccessUserGroupsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const STORE_ACCESS_USER_GROUPS: TypedDocumentNode<
  StoreAccessUserGroupsQuery,
  StoreAccessUserGroupsQueryVariables
> = gql`
  query storeAccessUserGroups {
    storeAccessUserGroups {
      _id
      name
      description
    }
  }
`;

export default STORE_ACCESS_USER_GROUPS;
