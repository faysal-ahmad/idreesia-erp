import gql from 'graphql-tag';

export const REMOVE_LOCATION = gql`
  mutation removeLocation($_id: String!, $physicalStoreId: String!) {
    removeLocation(_id: $_id, physicalStoreId: $physicalStoreId)
  }
`;
