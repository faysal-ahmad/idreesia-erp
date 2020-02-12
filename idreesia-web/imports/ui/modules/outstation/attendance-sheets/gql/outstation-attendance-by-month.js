import gql from 'graphql-tag';

const OUTSTATION_ATTENDANCE_BY_MONTH = gql`
  query outstationAttendanceByMonth(
    $month: String!
    $cityId: String
    $cityMehfilId: String
  ) {
    outstationAttendanceByMonth(
      month: $month
      cityId: $cityId
      cityMehfilId: $cityMehfilId
    ) {
      _id
      karkunId
      month
      attendanceDetails
      presentCount
      lateCount
      absentCount
      percentage
      karkun {
        _id
        name
        imageId
        cnicNumber
        contactNumber1
      }
    }
  }
`;

export default OUTSTATION_ATTENDANCE_BY_MONTH;
