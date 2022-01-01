import gql from 'graphql-tag';

const UPDATE_PORTAL_USER = gql`
  mutation updatePortalUser(
    $portalId: String!
    $userId: String!
    $password: String
    $locked: Boolean
  ) {
    updatePortalUser(
      portalId: $portalId
      userId: $userId
      password: $password
      locked: $locked
    ) {
      _id
      username
      locked
      personId
      karkun {
        _id
        name
      }
    }
  }
`;

export default UPDATE_PORTAL_USER;
