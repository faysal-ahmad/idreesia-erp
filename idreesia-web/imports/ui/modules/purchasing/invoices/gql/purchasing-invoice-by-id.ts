import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingInvoiceByIdQuery,
  PurchasingInvoiceByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_INVOICE_BY_ID: TypedDocumentNode<
  PurchasingInvoiceByIdQuery,
  PurchasingInvoiceByIdQueryVariables
> = gql`
  query purchasingInvoiceById($_id: String!) {
    purchasingInvoiceById(_id: $_id) {
      _id
      number
      vendorInvoiceNo
      vendorId
      vendor {
        _id
        name
      }
      orderId
      order {
        _id
        number
      }
      invoiceDate
      dueDate
      total
      paidAmount
      balance
      status
      isDisputed
      notes
      subtotal
      taxTotal
      lines {
        _id
        catalogItemId
        orderLineId
        description
        unit
        quantity
        unitPrice
        taxRate
      }
      voidedAt
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default PURCHASING_INVOICE_BY_ID;
