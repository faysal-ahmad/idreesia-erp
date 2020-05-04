import gql from 'graphql-tag';

const DUTY_SHIFTS_BY_DUTY_ID = gql`
  query dutyShiftsByDutyId($dutyId: String!) {
    dutyShiftsByDutyId(dutyId: $dutyId) {
      _id
      dutyId
      name
      startTime
      endTime
      attendanceSheet
      usedCount
    }
  }
`;

export default DUTY_SHIFTS_BY_DUTY_ID;
