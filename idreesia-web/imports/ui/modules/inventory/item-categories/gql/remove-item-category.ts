import gql from 'graphql-tag';

export const REMOVE_ITEM_CATEGORY = gql`
  mutation removeItemCategory($_id: String!, $physicalStoreId: String!) {
    removeItemCategory(_id: $_id, physicalStoreId: $physicalStoreId)
  }
`;
