import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  VoidPurchasingReceiptMutation,
  VoidPurchasingReceiptMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const VOID_PURCHASING_RECEIPT: TypedDocumentNode<
  VoidPurchasingReceiptMutation,
  VoidPurchasingReceiptMutationVariables
> = gql`
  mutation voidPurchasingReceipt($_id: String!, $reason: String!) {
    voidPurchasingReceipt(_id: $_id, reason: $reason) {
      _id
      status
    }
  }
`;

export default VOID_PURCHASING_RECEIPT;
