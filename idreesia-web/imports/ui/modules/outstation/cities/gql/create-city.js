import gql from 'graphql-tag';

const CREATE_CITY = gql`
  mutation createCity($name: String!, $country: String!) {
    createCity(name: $name, country: $country) {
      _id
      name
      country
    }
  }
`;

export default CREATE_CITY;
