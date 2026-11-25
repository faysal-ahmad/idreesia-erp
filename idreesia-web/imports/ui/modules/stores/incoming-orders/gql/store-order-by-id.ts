import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  StoreOrderByIdQuery,
  StoreOrderByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const STORE_ORDER_BY_ID: TypedDocumentNode<
  StoreOrderByIdQuery,
  StoreOrderByIdQueryVariables
> = gql`
  query storeOrderById($physicalStoreId: String!, $_id: String!) {
    storeOrderById(physicalStoreId: $physicalStoreId, _id: $_id) {
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
        externalCatalogId
        description
        unit
        quantity
        receivedQuantity
      }
    }
  }
`;
