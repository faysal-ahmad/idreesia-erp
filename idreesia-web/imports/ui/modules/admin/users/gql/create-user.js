import gql from 'graphql-tag';

const CREATE_USER = gql`
  mutation createUser(
    $userName: String
    $password: String
    $email: String
    $displayName: String
    $karkunId: String
  ) {
    createUser(
      userName: $userName
      password: $password
      email: $email
      displayName: $displayName
      karkunId: $karkunId
    ) {
      _id
    }
  }
`;

export default CREATE_USER;
