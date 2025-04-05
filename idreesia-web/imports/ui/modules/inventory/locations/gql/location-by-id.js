import gql from 'graphql-tag';

export const LOCATION_BY_ID = gql`
  query locationById($_id: String!, $physicalStoreId: String!) {
    locationById(_id: $_id, physicalStoreId: $physicalStoreId) {
      _id
      name
      parentId
      description
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;
