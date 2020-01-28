import gql from 'graphql-tag';

const CREATE_CITY_MEHFIL = gql`
  mutation createCityMehfil(
    $name: String!
    $cityId: String!
    $address: String
  ) {
    createCityMehfil(name: $name, cityId: $cityId, address: $address) {
      _id
      name
      cityId
      address
    }
  }
`;

export default CREATE_CITY_MEHFIL;
