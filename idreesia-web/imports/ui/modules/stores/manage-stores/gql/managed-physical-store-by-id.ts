import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ManagedPhysicalStoreByIdQuery,
  ManagedPhysicalStoreByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const MANAGED_PHYSICAL_STORE_BY_ID: TypedDocumentNode<
  ManagedPhysicalStoreByIdQuery,
  ManagedPhysicalStoreByIdQueryVariables
> = gql`
  query managedPhysicalStoreById($id: String!) {
    managedPhysicalStoreById(id: $id) {
      _id
      name
      address
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default MANAGED_PHYSICAL_STORE_BY_ID;
