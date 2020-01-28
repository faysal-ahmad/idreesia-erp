import gql from 'graphql-tag';

const CREATE_DUTY_SHIFT = gql`
  mutation createDutyShift(
    $name: String!
    $dutyId: String!
    $startTime: String
    $endTime: String
    $attendanceSheet: String
  ) {
    createDutyShift(
      name: $name
      dutyId: $dutyId
      startTime: $startTime
      endTime: $endTime
      attendanceSheet: $attendanceSheet
    ) {
      _id
      name
      dutyId
      startTime
      endTime
      attendanceSheet
    }
  }
`;

export default CREATE_DUTY_SHIFT;
