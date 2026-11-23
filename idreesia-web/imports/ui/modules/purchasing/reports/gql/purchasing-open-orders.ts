import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingOpenOrdersQuery,
  PurchasingOpenOrdersQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_OPEN_ORDERS: TypedDocumentNode<
  PurchasingOpenOrdersQuery,
  PurchasingOpenOrdersQueryVariables
> = gql`
  query purchasingOpenOrders {
    purchasingOpenOrders {
      orderId
      number
      vendorId
      vendor {
        _id
        name
      }
      status
      orderDate
      expectedDeliveryDate
      total
      outstandingValue
      isOverdue
    }
  }
`;

export default PURCHASING_OPEN_ORDERS;
