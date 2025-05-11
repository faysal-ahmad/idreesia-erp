import gql from 'graphql-tag';

export const LOCK_OUTSTATION_PORTAL_USER = gql`
  mutation lockOutstationPortalUser($userId: String!) {
    lockOutstationPortalUser(userId: $userId) {
      _id
    }
  }
`;
