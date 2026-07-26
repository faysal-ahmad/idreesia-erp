import gql from 'graphql-tag';

export const UPDATE_LOCATION = gql`
  mutation updateLocation(
    $_id: String!
    $physicalStoreId: String!
    $name: String!
    $parentId: String
    $description: String
  ) {
    updateLocation(
      _id: $_id
      physicalStoreId: $physicalStoreId
      name: $name
      parentId: $parentId
      description: $description
    ) {
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
