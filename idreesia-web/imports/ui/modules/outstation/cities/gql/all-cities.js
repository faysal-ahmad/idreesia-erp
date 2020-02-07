import gql from 'graphql-tag';

const ALL_CITIES = gql`
  query allCities {
    allCities {
      _id
      name
      country
      mehfils {
        _id
        name
      }
    }
  }
`;

export default ALL_CITIES;