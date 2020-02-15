import gql from 'graphql-tag';

const UPDATE_CITY = gql`
  mutation updateCity(
    $_id: String!
    $name: String!
    $country: String!
    $region: String
  ) {
    updateCity(_id: $_id, name: $name, country: $country, region: $region) {
      _id
      name
      region
      country
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_CITY;
