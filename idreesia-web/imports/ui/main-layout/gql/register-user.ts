import gql from 'graphql-tag';

export const REGISTER_USER = gql`
  mutation registerUser($displayName: String!, $email: String!) {
    registerUser(displayName: $displayName, email: $email)
  }
`;
