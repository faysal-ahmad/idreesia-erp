import gql from 'graphql-tag';

export const UPDATE_VENDOR = gql`
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
