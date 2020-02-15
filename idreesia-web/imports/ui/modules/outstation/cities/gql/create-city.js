import gql from 'graphql-tag';

const CREATE_CITY = gql`
  mutation createCity($name: String!, $country: String!, $region: String) {
    createCity(name: $name, country: $country, region: $region) {
      _id
      name
      region
      country
    }
  }
`;

export default CREATE_CITY;
