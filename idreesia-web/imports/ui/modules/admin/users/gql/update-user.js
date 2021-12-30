import gql from 'graphql-tag';

const UPDATE_USER = gql`
  mutation updateUser(
    $userId: String!
    $password: String
    $email: String
    $displayName: String
    $locked: Boolean
  ) {
    updateUser(
      userId: $userId
      password: $password
      email: $email
      displayName: $displayName
      locked: $locked
    ) {
      _id
      username
      email
      displayName
      locked
      personId
      karkun {
        _id
        name
      }
    }
  }
`;

export default UPDATE_USER;
