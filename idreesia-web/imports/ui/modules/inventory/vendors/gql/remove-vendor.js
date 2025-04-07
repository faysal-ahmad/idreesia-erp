import gql from 'graphql-tag';

export const REMOVE_VENDOR = gql`
  mutation removeVendor($_id: String!, $physicalStoreId: String!) {
    removeVendor(_id: $_id, physicalStoreId: $physicalStoreId)
  }
`;
