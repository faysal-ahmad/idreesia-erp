import gql from 'graphql-tag';

export const STOCK_ITEM_BY_ID = gql`
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
