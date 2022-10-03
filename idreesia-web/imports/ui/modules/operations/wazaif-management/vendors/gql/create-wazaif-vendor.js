import gql from 'graphql-tag';

export const CREATE_WAZAIF_VENDOR = gql`
  mutation createWazaifVendor(
    $name: String!
    $contactPerson: String
    $contactNumber: String
    $address: String
    $notes: String
  ) {
    createWazaifVendor(
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
