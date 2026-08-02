import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateVendorMutation,
  CreateVendorMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const CREATE_VENDOR: TypedDocumentNode<
  CreateVendorMutation,
  CreateVendorMutationVariables
> = gql`
  mutation createVendor(
    $name: String!
    $physicalStoreId: String!
    $contactPerson: String
    $contactNumber: String
    $address: String
    $notes: String
  ) {
    createVendor(
      name: $name
      physicalStoreId: $physicalStoreId
      contactPerson: $contactPerson
      contactNumber: $contactNumber
      address: $address
      notes: $notes
    ) {
      _id
      name
      physicalStoreId
      contactPerson
      contactNumber
      address
      notes
    }
  }
`;
