import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  StoreReceiptByIdQuery,
  StoreReceiptByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const STORE_RECEIPT_BY_ID: TypedDocumentNode<
  StoreReceiptByIdQuery,
  StoreReceiptByIdQueryVariables
> = gql`
  query storeReceiptById($physicalStoreId: String!, $_id: String!) {
    storeReceiptById(physicalStoreId: $physicalStoreId, _id: $_id) {
      _id
      number
      orderId
      orderNumber
      receivedDate
      receivedBy
      receivedByPerson {
        _id
        sharedData {
          name
        }
      }
      deliveryNoteNo
      notes
      status
      voidedAt
      voidReason
      createdAt
      lines {
        _id
        orderLineId
        externalCatalogId
        description
        unit
        receivedQuantity
        rejectedQuantity
        remarks
      }
    }
  }
`;
