import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedPurchasingOrdersQuery,
  PagedPurchasingOrdersQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_PURCHASING_ORDERS: TypedDocumentNode<
  PagedPurchasingOrdersQuery,
  PagedPurchasingOrdersQueryVariables
> = gql`
  query pagedPurchasingOrders($search: String, $status: String, $vendorId: String, $requisitionId: String, $fromDate: String, $toDate: String, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingOrders(search: $search, status: $status, vendorId: $vendorId, requisitionId: $requisitionId, fromDate: $fromDate, toDate: $toDate, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        _id
        number
        vendorId
        vendor {
          _id
          name
        }
        orderDate
        expectedDeliveryDate
        total
        status
        requisitionId
        version
      }
    }
  }
`;

export default PAGED_PURCHASING_ORDERS;
