import gql from 'graphql-tag';

const UPDATE_USER = gql`
  mutation updateUser(
    $userId: String!
    $password: String
    $email: String
    $displayName: String
    $locked: Boolean
    $karkunId: String
  ) {
    updateUser(
      userId: $userId
      password: $password
      email: $email
      displayName: $displayName
      locked: $locked
      karkunId: $karkunId
    ) {
      _id
      username
      email
      displayName
      locked
      karkunId
      karkun {
        _id
        name
      }
    }
  }
`;

export default UPDATE_USER;
