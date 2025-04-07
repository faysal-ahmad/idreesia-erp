import gql from 'graphql-tag';

export const CREATE_LOCATION = gql`
  mutation createLocation(
    $name: String!
    $physicalStoreId: String!
    $parentId: String
    $description: String
  ) {
    createLocation(
      name: $name
      physicalStoreId: $physicalStoreId
      parentId: $parentId
      description: $description
    ) {
      _id
      name
      parentId
      description
    }
  }
`;
