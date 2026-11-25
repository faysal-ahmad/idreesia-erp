import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedStoreOrdersQuery,
  PagedStoreOrdersQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const PAGED_STORE_ORDERS: TypedDocumentNode<
  PagedStoreOrdersQuery,
  PagedStoreOrdersQueryVariables
> = gql`
  query pagedStoreOrders(
    $physicalStoreId: String!
    $search: String
    $statuses: [String]
    $pageIndex: Int
    $pageSize: Int
  ) {
    pagedStoreOrders(
      physicalStoreId: $physicalStoreId
      search: $search
      statuses: $statuses
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        number
        requisitionId
        requisitionNumber
        vendorName
        orderDate
        expectedDeliveryDate
        status
        lines {
          _id
          quantity
          receivedQuantity
        }
      }
    }
  }
`;
