import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePurchasingInvoiceMutation,
  CreatePurchasingInvoiceMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_PURCHASING_INVOICE: TypedDocumentNode<
  CreatePurchasingInvoiceMutation,
  CreatePurchasingInvoiceMutationVariables
> = gql`
  mutation createPurchasingInvoice($vendorId: String!, $orderId: String, $vendorInvoiceNo: String!, $invoiceDate: String!, $dueDate: String, $notes: String, $allowOverBilling: Boolean, $lines: [PurchasingPricedLineInput!]!) {
    createPurchasingInvoice(vendorId: $vendorId, orderId: $orderId, vendorInvoiceNo: $vendorInvoiceNo, invoiceDate: $invoiceDate, dueDate: $dueDate, notes: $notes, allowOverBilling: $allowOverBilling, lines: $lines) {
      _id
    }
  }
`;

export default CREATE_PURCHASING_INVOICE;
