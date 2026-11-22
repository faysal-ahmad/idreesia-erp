import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ResetUserPasswordMutation,
  ResetUserPasswordMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const RESET_USER_PASSWORD: TypedDocumentNode<
  ResetUserPasswordMutation,
  ResetUserPasswordMutationVariables
> = gql`
  mutation resetUserPassword($userId: String!, $password: String!) {
    resetUserPassword(userId: $userId, password: $password) {
      _id
    }
  }
`;

export default RESET_USER_PASSWORD;
