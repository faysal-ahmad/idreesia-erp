import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PostPurchasingReceiptMutation,
  PostPurchasingReceiptMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const POST_PURCHASING_RECEIPT: TypedDocumentNode<
  PostPurchasingReceiptMutation,
  PostPurchasingReceiptMutationVariables
> = gql`
  mutation postPurchasingReceipt($orderId: String!, $receivedDate: String!, $receivedBy: String, $deliveryNoteNo: String, $notes: String, $lines: [PurchasingReceiptLineInput!]!) {
    postPurchasingReceipt(orderId: $orderId, receivedDate: $receivedDate, receivedBy: $receivedBy, deliveryNoteNo: $deliveryNoteNo, notes: $notes, lines: $lines) {
      _id
    }
  }
`;

export default POST_PURCHASING_RECEIPT;
