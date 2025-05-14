import gql from 'graphql-tag';

export const UPDATE_OUTSTATION_PORTAL_USER = gql`
  mutation updateOutstationPortalUser(
    $userId: String!
    $email: String!
    $portalId: String
  ) {
    updateOutstationPortalUser(
      userId: $userId
      email: $email
      portalId: $portalId
    ) {
      _id
      username
      email
      emailVerified
      locked
      personId
      instances
      karkun {
        _id
        name
      }
    }
  }
`;
