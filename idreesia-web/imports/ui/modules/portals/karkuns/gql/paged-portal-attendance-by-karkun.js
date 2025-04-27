import gql from 'graphql-tag';

const PAGED_PORTAL_ATTENDANCE_BY_KARKUN = gql`
  query pagedPortalAttendanceByKarkun(
    $portalId: String!
    $karkunId: String!
    $queryString: String!
  ) {
    pagedPortalAttendanceByKarkun(
      portalId: $portalId
      karkunId: $karkunId
      queryString: $queryString
    ) {
      totalResults
      attendance {
        _id
        month
        attendanceDetails
        absentCount
        presentCount
        percentage
      }
    }
  }
`;

export default PAGED_PORTAL_ATTENDANCE_BY_KARKUN;
