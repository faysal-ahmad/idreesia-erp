import gql from 'graphql-tag';

export const ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID = gql`
  query itemCategoriesByPhysicalStoreId($physicalStoreId: String!) {
    itemCategoriesByPhysicalStoreId(physicalStoreId: $physicalStoreId) {
      _id
      name
      physicalStoreId
      stockItemCount
    }
  }
`;
