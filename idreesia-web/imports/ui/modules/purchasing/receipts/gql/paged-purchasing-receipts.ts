import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedPurchasingReceiptsQuery,
  PagedPurchasingReceiptsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_PURCHASING_RECEIPTS: TypedDocumentNode<
  PagedPurchasingReceiptsQuery,
  PagedPurchasingReceiptsQueryVariables
> = gql`
  query pagedPurchasingReceipts($search: String, $status: String, $vendorId: String, $orderId: String, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingReceipts(search: $search, status: $status, vendorId: $vendorId, orderId: $orderId, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        _id
        number
        orderId
        order {
          _id
          number
        }
        vendorId
        vendor {
          _id
          name
        }
        receivedDate
        deliveryNoteNo
        status
      }
    }
  }
`;

export default PAGED_PURCHASING_RECEIPTS;
