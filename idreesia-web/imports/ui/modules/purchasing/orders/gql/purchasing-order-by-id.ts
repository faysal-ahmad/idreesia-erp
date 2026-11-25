import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingOrderByIdQuery,
  PurchasingOrderByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_ORDER_BY_ID: TypedDocumentNode<
  PurchasingOrderByIdQuery,
  PurchasingOrderByIdQueryVariables
> = gql`
  query purchasingOrderById($_id: String!) {
    purchasingOrderById(_id: $_id) {
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
      source
      externalSourceId
      version
      quoteId
      deliveryAddress
      paymentTermsDays
      notes
      discount
      shipping
      subtotal
      taxTotal
      lines {
        _id
        internalCatalogId
        externalCatalogId
        requisitionLineId
        description
        unit
        quantity
        unitPrice
        taxRate
        receivedQuantity
        invoicedQuantity
      }
      submittedAt
      approvedAt
      rejectionReason
      sentAt
      closedAt
      cancelledAt
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default PURCHASING_ORDER_BY_ID;
