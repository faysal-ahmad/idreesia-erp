import gql from 'graphql-tag';

const CREATE_USER = gql`
  mutation createUser(
    $userName: String
    $password: String
    $email: String
    $displayName: String
    $personId: String
  ) {
    createUser(
      userName: $userName
      password: $password
      email: $email
      displayName: $displayName
      personId: $personId
    ) {
      _id
    }
  }
`;

export default CREATE_USER;
