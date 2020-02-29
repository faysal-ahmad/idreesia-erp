import gql from 'graphql-tag';

const PAGED_CITIES = gql`
  query pagedCities($filter: CityFilter) {
    pagedCities(filter: $filter) {
      totalResults
      data {
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
  }
`;

export default PAGED_CITIES;
