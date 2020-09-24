import gql from 'graphql-tag';

const CREATE_OUTSTATION_PORTAL_USER = gql`
  mutation createOutstationPortalUser(
    $portalId: String!
    $userName: String!
    $karkunId: String!
  ) {
    createOutstationPortalUser(
      portalId: $portalId
      userName: $userName
      karkunId: $karkunId
    ) {
      _id
    }
  }
`;

export default CREATE_OUTSTATION_PORTAL_USER;
