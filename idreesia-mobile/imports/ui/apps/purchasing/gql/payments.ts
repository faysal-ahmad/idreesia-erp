import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobilePurchasingPagedPaymentsQuery,
  MobilePurchasingPagedPaymentsQueryVariables,
  MobilePurchasingPaymentByIdQuery,
  MobilePurchasingPaymentByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MOBILE_PURCHASING_PAGED_PAYMENTS: TypedDocumentNode<
  MobilePurchasingPagedPaymentsQuery,
  MobilePurchasingPagedPaymentsQueryVariables
> = gql`
  query mobilePurchasingPagedPayments($search: String, $status: String, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingPayments(search: $search, status: $status, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        _id
        number
        status
        paymentDate
        method
        amount
        vendor {
          _id
          name
        }
      }
    }
  }
`;

export const MOBILE_PURCHASING_PAYMENT_BY_ID: TypedDocumentNode<
  MobilePurchasingPaymentByIdQuery,
  MobilePurchasingPaymentByIdQueryVariables
> = gql`
  query mobilePurchasingPaymentById($_id: String!) {
    purchasingPaymentById(_id: $_id) {
      _id
      number
      status
      paymentDate
      method
      reference
      notes
      amount
      voidReason
      vendor {
        _id
        name
      }
      allocations {
        invoiceId
        amount
        invoice {
          _id
          number
          vendorInvoiceNo
        }
      }
    }
  }
`;
