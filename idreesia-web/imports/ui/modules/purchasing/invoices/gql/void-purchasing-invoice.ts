import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  VoidPurchasingInvoiceMutation,
  VoidPurchasingInvoiceMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const VOID_PURCHASING_INVOICE: TypedDocumentNode<
  VoidPurchasingInvoiceMutation,
  VoidPurchasingInvoiceMutationVariables
> = gql`
  mutation voidPurchasingInvoice($_id: String!) {
    voidPurchasingInvoice(_id: $_id) {
      _id
      status
    }
  }
`;

export default VOID_PURCHASING_INVOICE;
