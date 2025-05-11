import gql from 'graphql-tag';

export const OUTSTATION_PORTAL_USER_BY_ID = gql`
  query outstationPortalUserById($_id: String!) {
    outstationPortalUserById(_id: $_id) {
      _id
      username
      email
      emailVerified
      locked
      instances
      permissions
      personId
      karkun {
        _id
        name
      }
    }
  }
`;
