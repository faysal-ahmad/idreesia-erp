import gql from 'graphql-tag';

const UPDATE_OUTSTATION_PORTAL_USER = gql`
  mutation updateOutstationPortalUser(
    $portalId: String!
    $userId: String!
    $locked: Boolean!
  ) {
    updateOutstationPortalUser(
      portalId: $portalId
      userId: $userId
      locked: $locked
    ) {
      _id
      username
      locked
      karkunId
      karkun {
        _id
        name
      }
    }
  }
`;

export default UPDATE_OUTSTATION_PORTAL_USER;
