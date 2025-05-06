import gql from 'graphql-tag';

const PORTAL_ATTENDANCE_BY_MONTH = gql`
  query portalAttendanceByMonth(
    $portalId: String!
    $month: String!
    $cityId: String
    $cityMehfilId: String
  ) {
    portalAttendanceByMonth(
      portalId: $portalId
      month: $month
      cityId: $cityId
      cityMehfilId: $cityMehfilId
    ) {
      _id
      karkunId
      month
      attendanceDetails
      presentCount
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

export default PORTAL_ATTENDANCE_BY_MONTH;
