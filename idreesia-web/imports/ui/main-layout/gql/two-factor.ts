import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DisableTwoFactorMutation,
  DisableTwoFactorMutationVariables,
  EnableTwoFactorMutation,
  EnableTwoFactorMutationVariables,
  StartTwoFactorSetupMutation,
  StartTwoFactorSetupMutationVariables,
  TwoFactorStatusQuery,
  TwoFactorStatusQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const TWO_FACTOR_STATUS: TypedDocumentNode<
  TwoFactorStatusQuery,
  TwoFactorStatusQueryVariables
> = gql`
  query twoFactorStatus {
    currentUser {
      _id
      twoFactorEnabled
    }
  }
`;

export const START_TWO_FACTOR_SETUP: TypedDocumentNode<
  StartTwoFactorSetupMutation,
  StartTwoFactorSetupMutationVariables
> = gql`
  mutation startTwoFactorSetup {
    startTwoFactorSetup {
      qrCodeSvg
      secret
    }
  }
`;

export const ENABLE_TWO_FACTOR: TypedDocumentNode<
  EnableTwoFactorMutation,
  EnableTwoFactorMutationVariables
> = gql`
  mutation enableTwoFactor($code: String!) {
    enableTwoFactor(code: $code) {
      _id
      twoFactorEnabled
    }
  }
`;

export const DISABLE_TWO_FACTOR: TypedDocumentNode<
  DisableTwoFactorMutation,
  DisableTwoFactorMutationVariables
> = gql`
  mutation disableTwoFactor($code: String!) {
    disableTwoFactor(code: $code) {
      _id
      twoFactorEnabled
    }
  }
`;
