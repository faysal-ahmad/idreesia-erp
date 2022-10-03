import gql from 'graphql-tag';

export const UPDATE_WAZAIF_VENDOR = gql`
  mutation updateWazaifVendor(
    $_id: String!
    $name: String!
    $contactPerson: String
    $contactNumber: String
    $address: String
    $notes: String
  ) {
    updateWazaifVendor(
      _id: $_id
      name: $name
      contactPerson: $contactPerson
      contactNumber: $contactNumber
      address: $address
      notes: $notes
    ) {
      _id
      name
      contactPerson
      contactNumber
      address
      notes
      createdAt
      updatedAt
    }
  }
`;
