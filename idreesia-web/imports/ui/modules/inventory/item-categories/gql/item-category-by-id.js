import gql from 'graphql-tag';

export const ITEM_CATEGORY_BY_ID = gql`
  query itemCategoryById($_id: String!, $physicalStoreId: String!) {
    itemCategoryById(_id: $_id, physicalStoreId: $physicalStoreId) {
      _id
      name
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
