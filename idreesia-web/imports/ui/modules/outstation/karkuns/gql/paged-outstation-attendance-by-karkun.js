import gql from 'graphql-tag';

const PAGED_OUTSTATION_ATTENDANCE_BY_KARKUN = gql`
  query pagedOutstationAttendanceByKarkun(
    $karkunId: String!
    $queryString: String
  ) {
    pagedOutstationAttendanceByKarkun(
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

export default PAGED_OUTSTATION_ATTENDANCE_BY_KARKUN;
