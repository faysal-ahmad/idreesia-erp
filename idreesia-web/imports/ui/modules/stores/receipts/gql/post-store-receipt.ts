import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PostStoreReceiptMutation,
  PostStoreReceiptMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const POST_STORE_RECEIPT: TypedDocumentNode<
  PostStoreReceiptMutation,
  PostStoreReceiptMutationVariables
> = gql`
  mutation postStoreReceipt(
    $physicalStoreId: String!
    $orderId: String!
    $receivedDate: String!
    $receivedBy: String
    $deliveryNoteNo: String
    $notes: String
    $lines: [PurchasingReceiptLineInput!]!
  ) {
    postStoreReceipt(
      physicalStoreId: $physicalStoreId
      orderId: $orderId
      receivedDate: $receivedDate
      receivedBy: $receivedBy
      deliveryNoteNo: $deliveryNoteNo
      notes: $notes
      lines: $lines
    ) {
      _id
    }
  }
`;
