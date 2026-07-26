import gql from 'graphql-tag';

const CREATE_CITY = gql`
  mutation createCity(
    $name: String!
    $peripheryOf: String
    $country: String!
    $region: String
  ) {
    createCity(
      name: $name
      peripheryOf: $peripheryOf
      country: $country
      region: $region
    ) {
      _id
      name
      peripheryOf
      region
      country
    }
  }
`;

export default CREATE_CITY;
