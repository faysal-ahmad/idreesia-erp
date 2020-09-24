import gql from 'graphql-tag';

const RESET_OUTSTATION_PORTAL_USER_PASSWORD = gql`
  mutation resetOutstationPortalUserPassword($userId: String!) {
    resetOutstationPortalUserPassword(userId: $userId) {
      _id
    }
  }
`;

export default RESET_OUTSTATION_PORTAL_USER_PASSWORD;
