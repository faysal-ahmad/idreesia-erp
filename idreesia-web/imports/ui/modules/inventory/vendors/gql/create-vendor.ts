import gql from 'graphql-tag';

export const CREATE_VENDOR = gql`
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
