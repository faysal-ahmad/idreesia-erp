import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingReceiptByIdQuery,
  PurchasingReceiptByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_RECEIPT_BY_ID: TypedDocumentNode<
  PurchasingReceiptByIdQuery,
  PurchasingReceiptByIdQueryVariables
> = gql`
  query purchasingReceiptById($_id: String!) {
    purchasingReceiptById(_id: $_id) {
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
      receivedBy
      receivedByPerson {
        _id
        sharedData {
          name
        }
      }
      notes
      lines {
        _id
        orderLineId
        description
        unit
        receivedQuantity
        rejectedQuantity
        remarks
      }
      voidedAt
      voidReason
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default PURCHASING_RECEIPT_BY_ID;
