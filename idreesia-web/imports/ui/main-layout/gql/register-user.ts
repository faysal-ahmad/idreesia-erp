import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RegisterUserMutation,
  RegisterUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const REGISTER_USER: TypedDocumentNode<
  RegisterUserMutation,
  RegisterUserMutationVariables
> = gql`
  mutation registerUser($displayName: String!, $email: String!) {
    registerUser(displayName: $displayName, email: $email)
  }
`;
