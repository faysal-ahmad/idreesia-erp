import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileDisableTwoFactorMutation,
  MobileDisableTwoFactorMutationVariables,
  MobileEnableTwoFactorMutation,
  MobileEnableTwoFactorMutationVariables,
  MobileStartTwoFactorSetupMutation,
  MobileStartTwoFactorSetupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MOBILE_START_TWO_FACTOR_SETUP: TypedDocumentNode<
  MobileStartTwoFactorSetupMutation,
  MobileStartTwoFactorSetupMutationVariables
> = gql`
  mutation mobileStartTwoFactorSetup {
    startTwoFactorSetup {
      qrCodeSvg
      secret
    }
  }
`;

export const MOBILE_ENABLE_TWO_FACTOR: TypedDocumentNode<
  MobileEnableTwoFactorMutation,
  MobileEnableTwoFactorMutationVariables
> = gql`
  mutation mobileEnableTwoFactor($code: String!) {
    enableTwoFactor(code: $code) {
      _id
      twoFactorEnabled
    }
  }
`;

export const MOBILE_DISABLE_TWO_FACTOR: TypedDocumentNode<
  MobileDisableTwoFactorMutation,
  MobileDisableTwoFactorMutationVariables
> = gql`
  mutation mobileDisableTwoFactor($code: String!) {
    disableTwoFactor(code: $code) {
      _id
      twoFactorEnabled
    }
  }
`;
