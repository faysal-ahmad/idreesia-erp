import gql from 'graphql-tag';

const CITY_MEHFILS_BY_CITY_ID = gql`
  query cityMehfilsByCityId($cityId: String!) {
    cityMehfilsByCityId(cityId: $cityId) {
      _id
      cityId
      name
      address
      karkunCount
      mehfilStartYear
      timingDetails
      lcdAvailability
      tabAvailability
      otherMehfilDetails
    }
  }
`;

export default CITY_MEHFILS_BY_CITY_ID;
