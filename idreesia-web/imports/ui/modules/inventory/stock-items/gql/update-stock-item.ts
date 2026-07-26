import gql from 'graphql-tag';

export const UPDATE_STOCK_ITEM = gql`
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
