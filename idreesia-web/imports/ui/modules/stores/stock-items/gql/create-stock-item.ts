import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateStockItemMutation,
  CreateStockItemMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const CREATE_STOCK_ITEM: TypedDocumentNode<
  CreateStockItemMutation,
  CreateStockItemMutationVariables
> = gql`
  mutation createStockItem(
    $name: String!
    $company: String
    $details: String
    $unitOfMeasurement: String!
    $categoryId: String!
    $physicalStoreId: String!
    $minStockLevel: Float
    $currentStockLevel: Float
  ) {
    createStockItem(
      name: $name
      company: $company
      details: $details
      unitOfMeasurement: $unitOfMeasurement
      categoryId: $categoryId
      physicalStoreId: $physicalStoreId
      minStockLevel: $minStockLevel
      currentStockLevel: $currentStockLevel
    ) {
      _id
      name
      company
      details
      unitOfMeasurement
      categoryId
      physicalStoreId
      minStockLevel
      currentStockLevel
    }
  }
`;
