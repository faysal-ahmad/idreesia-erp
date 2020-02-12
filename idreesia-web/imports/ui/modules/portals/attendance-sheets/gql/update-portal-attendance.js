import gql from 'graphql-tag';

const UPDATE_PORTAL_ATTENDANCE = gql`
  mutation updatePortalAttendance(
    $portalId: String!
    $_id: String!
    $attendanceDetails: String
    $presentCount: Int
    $lateCount: Int
    $absentCount: Int
    $percentage: Int
  ) {
    updatePortalAttendance(
      portalId: $portalId
      _id: $_id
      attendanceDetails: $attendanceDetails
      presentCount: $presentCount
      lateCount: $lateCount
      absentCount: $absentCount
      percentage: $percentage
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

export default UPDATE_PORTAL_ATTENDANCE;
