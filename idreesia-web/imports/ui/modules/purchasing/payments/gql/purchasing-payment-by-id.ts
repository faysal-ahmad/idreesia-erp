import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingPaymentByIdQuery,
  PurchasingPaymentByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_PAYMENT_BY_ID: TypedDocumentNode<
  PurchasingPaymentByIdQuery,
  PurchasingPaymentByIdQueryVariables
> = gql`
  query purchasingPaymentById($_id: String!) {
    purchasingPaymentById(_id: $_id) {
      _id
      number
      vendorId
      vendor {
        _id
        name
      }
      paymentDate
      method
      reference
      amount
      status
      notes
      allocations {
        invoiceId
        amount
        invoice {
          _id
          number
          vendorInvoiceNo
          total
        }
      }
      voidedAt
      voidReason
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default PURCHASING_PAYMENT_BY_ID;
