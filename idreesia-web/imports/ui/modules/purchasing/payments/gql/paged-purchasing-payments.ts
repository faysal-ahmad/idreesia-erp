import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedPurchasingPaymentsQuery,
  PagedPurchasingPaymentsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_PURCHASING_PAYMENTS: TypedDocumentNode<
  PagedPurchasingPaymentsQuery,
  PagedPurchasingPaymentsQueryVariables
> = gql`
  query pagedPurchasingPayments($search: String, $status: String, $vendorId: String, $fromDate: String, $toDate: String, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingPayments(search: $search, status: $status, vendorId: $vendorId, fromDate: $fromDate, toDate: $toDate, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
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
      }
    }
  }
`;

export default PAGED_PURCHASING_PAYMENTS;
