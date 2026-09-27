import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileRegisterUserMutation,
  MobileRegisterUserMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MOBILE_REGISTER_USER: TypedDocumentNode<
  MobileRegisterUserMutation,
  MobileRegisterUserMutationVariables
> = gql`
  mutation mobileRegisterUser($displayName: String!, $email: String!) {
    registerUser(displayName: $displayName, email: $email)
  }
`;
