import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobilePurchasingApproveOrderMutation,
  MobilePurchasingApproveOrderMutationVariables,
  MobilePurchasingOrderByIdQuery,
  MobilePurchasingOrderByIdQueryVariables,
  MobilePurchasingPagedOrdersQuery,
  MobilePurchasingPagedOrdersQueryVariables,
  MobilePurchasingReturnOrderToDraftMutation,
  MobilePurchasingReturnOrderToDraftMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MOBILE_PURCHASING_PAGED_ORDERS: TypedDocumentNode<
  MobilePurchasingPagedOrdersQuery,
  MobilePurchasingPagedOrdersQueryVariables
> = gql`
  query mobilePurchasingPagedOrders(
    $search: String
    $status: String
    $statuses: [String]
    $vendorId: String
    $pageIndex: Int
    $pageSize: Int
  ) {
    pagedPurchasingOrders(
      search: $search
      status: $status
      statuses: $statuses
      vendorId: $vendorId
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        _id
        number
        status
        orderDate
        expectedDeliveryDate
        total
        vendor {
          _id
          name
        }
      }
    }
  }
`;

export const MOBILE_PURCHASING_ORDER_BY_ID: TypedDocumentNode<
  MobilePurchasingOrderByIdQuery,
  MobilePurchasingOrderByIdQueryVariables
> = gql`
  query mobilePurchasingOrderById($_id: String!) {
    purchasingOrderById(_id: $_id) {
      _id
      number
      status
      version
      orderDate
      expectedDeliveryDate
      deliveryAddress
      paymentTermsDays
      notes
      rejectionReason
      subtotal
      taxTotal
      discount
      shipping
      total
      vendor {
        _id
        name
        phone
      }
      lines {
        _id
        description
        unit
        quantity
        unitPrice
        taxRate
        receivedQuantity
        invoicedQuantity
      }
    }
  }
`;

export const MOBILE_PURCHASING_APPROVE_ORDER: TypedDocumentNode<
  MobilePurchasingApproveOrderMutation,
  MobilePurchasingApproveOrderMutationVariables
> = gql`
  mutation mobilePurchasingApproveOrder($_id: String!) {
    approvePurchasingOrder(_id: $_id) {
      _id
      status
    }
  }
`;

// Sends a submitted order back to a draft, with a reason.
export const MOBILE_PURCHASING_RETURN_ORDER_TO_DRAFT: TypedDocumentNode<
  MobilePurchasingReturnOrderToDraftMutation,
  MobilePurchasingReturnOrderToDraftMutationVariables
> = gql`
  mutation mobilePurchasingReturnOrderToDraft($_id: String!, $reason: String!) {
    rejectPurchasingOrder(_id: $_id, reason: $reason) {
      _id
      status
    }
  }
`;
