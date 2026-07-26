import gql from 'graphql-tag';

const CREATE_CITY_MEHFIL = gql`
  mutation createCityMehfil(
    $name: String!
    $cityId: String!
    $address: String
    $mehfilStartYear: String
    $timingDetails: String
    $lcdAvailability: Boolean
    $tabAvailability: Boolean
    $otherMehfilDetails: String
  ) {
    createCityMehfil(
      name: $name
      cityId: $cityId
      address: $address
      mehfilStartYear: $mehfilStartYear
      timingDetails: $timingDetails
      lcdAvailability: $lcdAvailability
      tabAvailability: $tabAvailability
      otherMehfilDetails: $otherMehfilDetails
    ) {
      _id
      name
      cityId
      address
      mehfilStartYear
      timingDetails
      lcdAvailability
      tabAvailability
      otherMehfilDetails
    }
  }
`;

export default CREATE_CITY_MEHFIL;
