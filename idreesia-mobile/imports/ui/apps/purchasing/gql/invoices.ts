import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobilePurchasingInvoiceByIdQuery,
  MobilePurchasingInvoiceByIdQueryVariables,
  MobilePurchasingPagedInvoicesQuery,
  MobilePurchasingPagedInvoicesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MOBILE_PURCHASING_PAGED_INVOICES: TypedDocumentNode<
  MobilePurchasingPagedInvoicesQuery,
  MobilePurchasingPagedInvoicesQueryVariables
> = gql`
  query mobilePurchasingPagedInvoices(
    $search: String
    $status: String
    $overdue: Boolean
    $pageIndex: Int
    $pageSize: Int
  ) {
    pagedPurchasingInvoices(
      search: $search
      status: $status
      overdue: $overdue
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        number
        vendorInvoiceNo
        status
        isDisputed
        invoiceDate
        dueDate
        total
        balance
        vendor {
          _id
          name
        }
      }
    }
  }
`;

export const MOBILE_PURCHASING_INVOICE_BY_ID: TypedDocumentNode<
  MobilePurchasingInvoiceByIdQuery,
  MobilePurchasingInvoiceByIdQueryVariables
> = gql`
  query mobilePurchasingInvoiceById($_id: String!) {
    purchasingInvoiceById(_id: $_id) {
      _id
      number
      vendorInvoiceNo
      status
      isDisputed
      invoiceDate
      dueDate
      notes
      subtotal
      taxTotal
      total
      paidAmount
      balance
      vendor {
        _id
        name
      }
      order {
        _id
        number
      }
      lines {
        _id
        description
        unit
        quantity
        unitPrice
        taxRate
      }
    }
  }
`;
