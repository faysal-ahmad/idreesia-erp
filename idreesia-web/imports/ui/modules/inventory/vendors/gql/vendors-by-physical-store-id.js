import gql from 'graphql-tag';

export const VENDORS_BY_PHYSICAL_STORE_ID = gql`
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
