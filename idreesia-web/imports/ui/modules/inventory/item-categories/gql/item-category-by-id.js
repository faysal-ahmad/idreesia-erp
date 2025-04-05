import gql from 'graphql-tag';

export const ITEM_CATEGORY_BY_ID = gql`
  query itemCategoryById($id: String!, $physicalStoreId: String!) {
    itemCategoryById(id: $id, physicalStoreId: $physicalStoreId) {
      _id
      name
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
