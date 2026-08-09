import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateVendorMutation,
  UpdateVendorMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const UPDATE_VENDOR: TypedDocumentNode<
  UpdateVendorMutation,
  UpdateVendorMutationVariables
> = gql`
  mutation updateVendor(
    $_id: String!
    $physicalStoreId: String!
    $name: String!
    $contactPerson: String
    $contactNumber: String
    $address: String
    $notes: String
  ) {
    updateVendor(
      _id: $_id
      physicalStoreId: $physicalStoreId
      name: $name
      contactPerson: $contactPerson
      contactNumber: $contactNumber
      address: $address
      notes: $notes
    ) {
      _id
      physicalStoreId
      name
      contactPerson
      contactNumber
      address
      notes
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
