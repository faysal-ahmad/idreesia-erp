import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PostPurchasingPaymentMutation,
  PostPurchasingPaymentMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const POST_PURCHASING_PAYMENT: TypedDocumentNode<
  PostPurchasingPaymentMutation,
  PostPurchasingPaymentMutationVariables
> = gql`
  mutation postPurchasingPayment($vendorId: String!, $paymentDate: String!, $method: String!, $reference: String, $notes: String, $allocations: [PurchasingPaymentAllocationInput!]!) {
    postPurchasingPayment(vendorId: $vendorId, paymentDate: $paymentDate, method: $method, reference: $reference, notes: $notes, allocations: $allocations) {
      _id
    }
  }
`;

export default POST_PURCHASING_PAYMENT;
