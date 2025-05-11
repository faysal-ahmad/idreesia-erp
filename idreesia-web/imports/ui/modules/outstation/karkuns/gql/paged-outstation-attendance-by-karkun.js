import gql from 'graphql-tag';

export const PAGED_OUTSTATION_ATTENDANCE_BY_KARKUN = gql`
  query pagedOutstationAttendanceByKarkun(
    $karkunId: String!
    $queryString: String
  ) {
    pagedOutstationAttendanceByKarkun(
      karkunId: $karkunId
      queryString: $queryString
    ) {
      totalResults
      data {
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
