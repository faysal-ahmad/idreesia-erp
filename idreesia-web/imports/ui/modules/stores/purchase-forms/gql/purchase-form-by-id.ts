import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  InventoryPurchaseFormByIdQuery,
  InventoryPurchaseFormByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const PURCHASE_FORM_BY_ID: TypedDocumentNode<
  InventoryPurchaseFormByIdQuery,
  InventoryPurchaseFormByIdQueryVariables
> = gql`
  query inventoryPurchaseFormById($_id: String!, $physicalStoreId: String!) {
    purchaseFormById(_id: $_id, physicalStoreId: $physicalStoreId) {
      _id
      purchaseDate
      receivedBy
      purchasedBy
      physicalStoreId
      locationId
      vendorId
      approvedOn
      createdAt
      createdBy
      updatedAt
      updatedBy
      items {
        stockItemId
        quantity
        isInflow
        price
        refStockItem {
          _id
          name
          unitOfMeasurement
        }
      }
      attachments {
        _id
        name
        description
        mimeType
      }
      refReceivedBy {
        _id
        sharedData {
          name
        }
      }
      refPurchasedBy {
        _id
        sharedData {
          name
        }
      }
      refVendor {
        _id
        name
      }
      refLocation {
        _id
        name
      }
      notes
    }
  }
`;
