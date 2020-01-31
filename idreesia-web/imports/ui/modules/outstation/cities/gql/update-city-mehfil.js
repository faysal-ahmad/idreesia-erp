import gql from 'graphql-tag';

const UPDATE_CITY_MEHFIL = gql`
  mutation updateCityMehfil(
    $_id: String!
    $name: String!
    $cityId: String!
    $address: String
  ) {
    updateCityMehfil(
      _id: $_id
      name: $name
      cityId: $cityId
      address: $address
    ) {
      _id
      name
      cityId
      address
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_CITY_MEHFIL;
