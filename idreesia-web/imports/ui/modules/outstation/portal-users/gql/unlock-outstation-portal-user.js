import gql from 'graphql-tag';

export const UNLOCK_OUTSTATION_PORTAL_USER = gql`
  mutation unlockOutstationPortalUser($userId: String!) {
    unlockOutstationPortalUser(userId: $userId) {
      _id
    }
  }
`;
