import gql from 'graphql-tag';

const UPDATE_DUTY_SHIFT = gql`
  mutation updateDutyShift(
    $_id: String!
    $name: String!
    $dutyId: String!
    $startTime: String
    $endTime: String
    $attendanceSheet: String
  ) {
    updateDutyShift(
      _id: $_id
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
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_DUTY_SHIFT;
