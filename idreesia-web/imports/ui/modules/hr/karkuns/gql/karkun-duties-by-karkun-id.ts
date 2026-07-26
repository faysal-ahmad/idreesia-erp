import gql from 'graphql-tag';

const KARKUN_DUTIES_BY_KARKUN_ID = gql`
  query karkunDutiesByKarkunId($karkunId: String!) {
    karkunDutiesByKarkunId(karkunId: $karkunId) {
      _id
      dutyId
      dutyName
      shiftId
      shiftName
      locationName
      role
      daysOfWeek
    }
  }
`;

export default KARKUN_DUTIES_BY_KARKUN_ID;
