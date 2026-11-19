import gql from 'graphql-tag';

// What a user of a Duties and Attendance workspace may do
// (DutiesAttendancePermissions).
export default gql`
enum DutiesAttendancePermission {
  VIEW
  MANAGE_AND_PLAN_DUTIES
  MARK_ATTENDANCE
}

directive @checkDutiesAttendanceAccess(
  permission: DutiesAttendancePermission!,
  locationIdArgName: String,
) on FIELD_DEFINITION`;
