import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedPurchasingInvoicesQuery,
  PagedPurchasingInvoicesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_PURCHASING_INVOICES: TypedDocumentNode<
  PagedPurchasingInvoicesQuery,
  PagedPurchasingInvoicesQueryVariables
> = gql`
  query pagedPurchasingInvoices($search: String, $status: String, $vendorId: String, $orderId: String, $isDisputed: Boolean, $overdue: Boolean, $fromDate: String, $toDate: String, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingInvoices(search: $search, status: $status, vendorId: $vendorId, orderId: $orderId, isDisputed: $isDisputed, overdue: $overdue, fromDate: $fromDate, toDate: $toDate, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
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
      }
    }
  }
`;

export default PAGED_PURCHASING_INVOICES;
