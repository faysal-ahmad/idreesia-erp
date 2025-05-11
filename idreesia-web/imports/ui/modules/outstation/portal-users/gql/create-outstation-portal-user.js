import gql from 'graphql-tag';

export const CREATE_OUTSTATION_PORTAL_USER = gql`
  mutation createOutstationPortalUser(
    $portalId: String!
    $email: String!
    $karkunId: String!
  ) {
    createOutstationPortalUser(
      portalId: $portalId
      email: $email
      karkunId: $karkunId
    ) {
      _id
    }
  }
`;
