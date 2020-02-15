import gql from 'graphql-tag';

const ALL_CITIES = gql`
  query allCities {
    allCities {
      _id
      name
      country
      region
      mehfils {
        _id
        name
      }
    }
  }
`;

export default ALL_CITIES;
