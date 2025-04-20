import gql from 'graphql-tag';

export const REGISTER_USER = gql`
  mutation registerUser($email: String!) {
    registerUser(email: $email)
  }
`;
