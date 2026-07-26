import gql from 'graphql-tag';

export const SET_STOCK_ITEM_IMAGE = gql`
  mutation setStockItemImage(
    $_id: String!
    $physicalStoreId: String!
    $imageId: String!
  ) {
    setStockItemImage(
      _id: $_id
      physicalStoreId: $physicalStoreId
      imageId: $imageId
    ) {
      _id
      imageId
    }
  }
`;
