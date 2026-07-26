import gql from 'graphql-tag';

export const UPDATE_ITEM_CATEGORY = gql`
  mutation updateItemCategory(
    $_id: String!
    $physicalStoreId: String!
    $name: String!
  ) {
    updateItemCategory(
      _id: $_id
      physicalStoreId: $physicalStoreId
      name: $name
    ) {
      _id
      name
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
