import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePurchaseFormMutation,
  CreatePurchaseFormMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const CREATE_PURCHASE_FORM: TypedDocumentNode<
  CreatePurchaseFormMutation,
  CreatePurchaseFormMutationVariables
> = gql`
  mutation createPurchaseForm(
    $purchaseDate: String!
    $receivedBy: String!
    $purchasedBy: String!
    $physicalStoreId: String!
    $locationId: String
    $vendorId: String
    $items: [ItemWithQuantityAndPriceInput]
    $notes: String
  ) {
    createPurchaseForm(
      purchaseDate: $purchaseDate
      receivedBy: $receivedBy
      purchasedBy: $purchasedBy
      physicalStoreId: $physicalStoreId
      locationId: $locationId
      vendorId: $vendorId
      items: $items
      notes: $notes
    ) {
      _id
      purchaseDate
      physicalStoreId
      locationId
      vendorId
      items {
        stockItemId
        quantity
        isInflow
        price
      }
      refReceivedBy {
        _id
        name
      }
      refPurchasedBy {
        _id
        name
      }
      notes
    }
  }
`;
