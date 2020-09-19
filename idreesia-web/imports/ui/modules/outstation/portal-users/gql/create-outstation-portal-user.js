import gql from 'graphql-tag';

const CREATE_OUTSTATION_PORTAL_USER = gql`
  mutation createOutstationPortalUser(
    $portalId: String!
    $userName: String!
    $password: String!
    $karkunId: String!
  ) {
    createOutstationPortalUser(
      portalId: $portalId
      userName: $userName
      password: $password
      karkunId: $karkunId
    ) {
      _id
    }
  }
`;

export default CREATE_OUTSTATION_PORTAL_USER;
