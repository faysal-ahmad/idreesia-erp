import gql from 'graphql-tag';

export const CREATE_ORG_LOCATION = gql`
  mutation createOrgLocation(
    $name: String!
    $type: String!
    $parentId: String!
  ) {
    createOrgLocation(name: $name, type: $type, parentId: $parentId) {
      _id
      name
      type
    }
  }
`;
