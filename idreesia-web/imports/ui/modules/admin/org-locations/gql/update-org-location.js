import gql from 'graphql-tag';

export const UPDATE_ORG_LOCATION = gql`
  mutation updateOrgLocation(
    $_id: String!
    $name: String!
    $mehfilDetails: MehfilDetailsInput
  ) {
    updateOrgLocation(_id: $_id, name: $name, mehfilDetails: $mehfilDetails) {
      _id
      name
      type
      parentId
      mehfilDetails
    }
  }
`;
