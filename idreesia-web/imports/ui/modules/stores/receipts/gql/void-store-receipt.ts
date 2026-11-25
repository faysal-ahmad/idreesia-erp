import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  VoidStoreReceiptMutation,
  VoidStoreReceiptMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const VOID_STORE_RECEIPT: TypedDocumentNode<
  VoidStoreReceiptMutation,
  VoidStoreReceiptMutationVariables
> = gql`
  mutation voidStoreReceipt(
    $physicalStoreId: String!
    $_id: String!
    $reason: String!
  ) {
    voidStoreReceipt(physicalStoreId: $physicalStoreId, _id: $_id, reason: $reason) {
      _id
    }
  }
`;
