import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  VendorByIdQuery,
  VendorByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const VENDOR_BY_ID: TypedDocumentNode<
  VendorByIdQuery,
  VendorByIdQueryVariables
> = gql`
  query vendorById($_id: String!, $physicalStoreId: String!) {
    vendorById(_id: $_id, physicalStoreId: $physicalStoreId) {
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
