import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  VoidPurchasingPaymentMutation,
  VoidPurchasingPaymentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const VOID_PURCHASING_PAYMENT: TypedDocumentNode<
  VoidPurchasingPaymentMutation,
  VoidPurchasingPaymentMutationVariables
> = gql`
  mutation voidPurchasingPayment($_id: String!, $reason: String!) {
    voidPurchasingPayment(_id: $_id, reason: $reason) {
      _id
      status
    }
  }
`;

export default VOID_PURCHASING_PAYMENT;
