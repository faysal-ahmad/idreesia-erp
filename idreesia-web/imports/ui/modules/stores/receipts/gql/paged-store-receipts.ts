import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedStoreReceiptsQuery,
  PagedStoreReceiptsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const PAGED_STORE_RECEIPTS: TypedDocumentNode<
  PagedStoreReceiptsQuery,
  PagedStoreReceiptsQueryVariables
> = gql`
  query pagedStoreReceipts(
    $physicalStoreId: String!
    $search: String
    $status: String
    $pageIndex: Int
    $pageSize: Int
  ) {
    pagedStoreReceipts(
      physicalStoreId: $physicalStoreId
      search: $search
      status: $status
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        number
        orderId
        orderNumber
        receivedDate
        deliveryNoteNo
        status
        receivedByPerson {
          _id
          sharedData {
            name
          }
        }
      }
    }
  }
`;
