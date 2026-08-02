import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  StockItemByIdQuery,
  StockItemByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const STOCK_ITEM_BY_ID: TypedDocumentNode<
  StockItemByIdQuery,
  StockItemByIdQueryVariables
> = gql`
  query stockItemById($_id: String!, $physicalStoreId: String!) {
    stockItemById(_id: $_id, physicalStoreId: $physicalStoreId) {
      _id
      physicalStoreId
      name
      company
      details
      imageId
      categoryId
      unitOfMeasurement
      startingStockLevel
      currentStockLevel
      minStockLevel
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
