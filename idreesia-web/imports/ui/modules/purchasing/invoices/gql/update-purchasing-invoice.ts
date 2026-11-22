import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdatePurchasingInvoiceMutation,
  UpdatePurchasingInvoiceMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_PURCHASING_INVOICE: TypedDocumentNode<
  UpdatePurchasingInvoiceMutation,
  UpdatePurchasingInvoiceMutationVariables
> = gql`
  mutation updatePurchasingInvoice($_id: String!, $vendorInvoiceNo: String!, $dueDate: String!, $notes: String) {
    updatePurchasingInvoice(_id: $_id, vendorInvoiceNo: $vendorInvoiceNo, dueDate: $dueDate, notes: $notes) {
      _id
    }
  }
`;

export default UPDATE_PURCHASING_INVOICE;
