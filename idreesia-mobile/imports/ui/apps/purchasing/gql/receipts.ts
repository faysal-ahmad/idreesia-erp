import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobilePurchasingPagedReceiptsQuery,
  MobilePurchasingPagedReceiptsQueryVariables,
  MobilePurchasingPostReceiptMutation,
  MobilePurchasingPostReceiptMutationVariables,
  MobilePurchasingReceiptByIdQuery,
  MobilePurchasingReceiptByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MOBILE_PURCHASING_PAGED_RECEIPTS: TypedDocumentNode<
  MobilePurchasingPagedReceiptsQuery,
  MobilePurchasingPagedReceiptsQueryVariables
> = gql`
  query mobilePurchasingPagedReceipts($search: String, $status: String, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingReceipts(search: $search, status: $status, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        _id
        number
        status
        receivedDate
        deliveryNoteNo
        vendor {
          _id
          name
        }
        order {
          _id
          number
        }
      }
    }
  }
`;

export const MOBILE_PURCHASING_RECEIPT_BY_ID: TypedDocumentNode<
  MobilePurchasingReceiptByIdQuery,
  MobilePurchasingReceiptByIdQueryVariables
> = gql`
  query mobilePurchasingReceiptById($_id: String!) {
    purchasingReceiptById(_id: $_id) {
      _id
      number
      status
      receivedDate
      deliveryNoteNo
      notes
      voidReason
      vendor {
        _id
        name
      }
      order {
        _id
        number
      }
      receivedByPerson {
        _id
        sharedData {
          name
        }
      }
      lines {
        _id
        description
        unit
        receivedQuantity
        rejectedQuantity
        remarks
      }
    }
  }
`;

export const MOBILE_PURCHASING_POST_RECEIPT: TypedDocumentNode<
  MobilePurchasingPostReceiptMutation,
  MobilePurchasingPostReceiptMutationVariables
> = gql`
  mutation mobilePurchasingPostReceipt(
    $orderId: String!
    $receivedDate: String!
    $receivedBy: String
    $deliveryNoteNo: String
    $notes: String
    $lines: [PurchasingReceiptLineInput!]!
  ) {
    postPurchasingReceipt(
      orderId: $orderId
      receivedDate: $receivedDate
      receivedBy: $receivedBy
      deliveryNoteNo: $deliveryNoteNo
      notes: $notes
      lines: $lines
    ) {
      _id
      number
    }
  }
`;
