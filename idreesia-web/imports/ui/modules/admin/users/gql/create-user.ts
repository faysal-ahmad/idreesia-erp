import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateUserMutation,
  CreateUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_USER: TypedDocumentNode<
  CreateUserMutation,
  CreateUserMutationVariables
> = gql`
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
