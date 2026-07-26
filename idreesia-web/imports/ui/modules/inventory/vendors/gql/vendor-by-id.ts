import gql from 'graphql-tag';

export const VENDOR_BY_ID = gql`
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
