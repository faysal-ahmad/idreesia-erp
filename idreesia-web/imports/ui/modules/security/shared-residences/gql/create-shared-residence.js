import gql from 'graphql-tag';

export const CREATE_SHARED_RESIDENCE = gql`
  mutation createSharedResidence($name: String!, $address: String) {
    createSharedResidence(name: $name, address: $address) {
      _id
      name
      address
    }
  }
`;
