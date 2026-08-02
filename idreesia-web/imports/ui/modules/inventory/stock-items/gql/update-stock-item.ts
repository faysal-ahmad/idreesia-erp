import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateStockItemMutation,
  UpdateStockItemMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const UPDATE_STOCK_ITEM: TypedDocumentNode<
  UpdateStockItemMutation,
  UpdateStockItemMutationVariables
> = gql`
  mutation updateStockItem(
    $_id: String!
    $physicalStoreId: String!
    $name: String!
    $company: String
    $details: String
    $unitOfMeasurement: String!
    $categoryId: String!
    $minStockLevel: Float
  ) {
    updateStockItem(
      _id: $_id
      physicalStoreId: $physicalStoreId
      name: $name
      company: $company
      details: $details
      unitOfMeasurement: $unitOfMeasurement
      categoryId: $categoryId
      minStockLevel: $minStockLevel
    ) {
      _id
      physicalStoreId
      name
      company
      details
      categoryId
      unitOfMeasurement
      minStockLevel
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
