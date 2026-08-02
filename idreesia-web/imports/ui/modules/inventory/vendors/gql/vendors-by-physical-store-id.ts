import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  VendorsByPhysicalStoreIdQuery,
  VendorsByPhysicalStoreIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const VENDORS_BY_PHYSICAL_STORE_ID: TypedDocumentNode<
  VendorsByPhysicalStoreIdQuery,
  VendorsByPhysicalStoreIdQueryVariables
> = gql`
  query vendorsByPhysicalStoreId($physicalStoreId: String!) {
    vendorsByPhysicalStoreId(physicalStoreId: $physicalStoreId) {
      _id
      name
      physicalStoreId
      contactPerson
      contactNumber
      address
      notes
      usageCount
    }
  }
`;
