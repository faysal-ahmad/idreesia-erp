import gql from 'graphql-tag';

const OUTSTATION_PORTAL_USER_BY_ID = gql`
  query outstationPortalUserById($_id: String!) {
    outstationPortalUserById(_id: $_id) {
      _id
      username
      locked
      instances
      permissions
      karkunId
      karkun {
        _id
        name
      }
    }
  }
`;

export default OUTSTATION_PORTAL_USER_BY_ID;
