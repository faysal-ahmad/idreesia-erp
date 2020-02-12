import gql from 'graphql-tag';

const DELETE_ALL_PORTAL_ATTENDANCES = gql`
  mutation deleteAllPortalAttendances(
    $portalId: String!
    $month: String!
    $cityId: String
    $cityMehfilId: String
  ) {
    deleteAllPortalAttendances(
      portalId: $portalId
      month: $month
      cityId: $cityId
      cityMehfilId: $cityMehfilId
    )
  }
`;

export default DELETE_ALL_PORTAL_ATTENDANCES;
