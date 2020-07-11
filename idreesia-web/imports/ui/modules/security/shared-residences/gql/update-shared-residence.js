import gql from 'graphql-tag';

export const UPDATE_SHARED_RESIDENCE = gql`
  mutation updateSharedResidence(
    $_id: String!
    $name: String!
    $address: String
  ) {
    updateSharedResidence(_id: $_id, name: $name, address: $address) {
      _id
      name
      address
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
