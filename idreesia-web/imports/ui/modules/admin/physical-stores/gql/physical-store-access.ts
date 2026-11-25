import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PhysicalStoreAccessQuery,
  PhysicalStoreAccessQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PHYSICAL_STORE_ACCESS: TypedDocumentNode<
  PhysicalStoreAccessQuery,
  PhysicalStoreAccessQueryVariables
> = gql`
  query physicalStoreAccess($physicalStoreId: String!) {
    physicalStoreAccess(physicalStoreId: $physicalStoreId) {
      key
      name
      groupName
      users {
        userId
        personId
        username
        displayName
      }
      groups {
        groupId
        name
      }
    }
  }
`;

export default PHYSICAL_STORE_ACCESS;
