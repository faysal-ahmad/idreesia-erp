import gql from 'graphql-tag';

export const CREATE_ITEM_CATEGORY = gql`
  mutation createItemCategory($name: String!, $physicalStoreId: String!) {
    createItemCategory(name: $name, physicalStoreId: $physicalStoreId) {
      _id
      name
      physicalStoreId
    }
  }
`;
