import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ResetTwoFactorMutation,
  ResetTwoFactorMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const RESET_TWO_FACTOR: TypedDocumentNode<
  ResetTwoFactorMutation,
  ResetTwoFactorMutationVariables
> = gql`
  mutation resetTwoFactor($userId: String!) {
    resetTwoFactor(userId: $userId) {
      _id
      twoFactorEnabled
    }
  }
`;

export default RESET_TWO_FACTOR;
