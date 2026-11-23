import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingUserGroupsQuery,
  PurchasingUserGroupsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_USER_GROUPS: TypedDocumentNode<PurchasingUserGroupsQuery, PurchasingUserGroupsQueryVariables> = gql`
  query purchasingUserGroups {
    purchasingUserGroups {
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

export default PURCHASING_USER_GROUPS;
