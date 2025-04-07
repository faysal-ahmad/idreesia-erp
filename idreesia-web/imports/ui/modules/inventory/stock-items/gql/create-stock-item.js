import gql from 'graphql-tag';

export const CREATE_STOCK_ITEM = gql`
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
