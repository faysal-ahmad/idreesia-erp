import gql from 'graphql-tag';

const UPDATE_KARKUN_DUTY = gql`
  mutation updateKarkunDuty(
    $_id: String!
    $karkunId: String!
    $dutyId: String!
    $shiftId: String
    $locationId: String
    $role: String
    $daysOfWeek: [String]
  ) {
    updateKarkunDuty(
      _id: $_id
      karkunId: $karkunId
      dutyId: $dutyId
      shiftId: $shiftId
      locationId: $locationId
      role: $role
      daysOfWeek: $daysOfWeek
    ) {
      _id
      dutyId
      dutyName
      shiftId
      shiftName
      locationId
      locationName
      role
      daysOfWeek
    }
  }
`;

export default UPDATE_KARKUN_DUTY;
