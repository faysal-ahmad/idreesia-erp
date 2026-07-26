import gql from 'graphql-tag';

const PAGED_CITIES = gql`
  query pagedCities($filter: CityFilter) {
    pagedCities(filter: $filter) {
      totalResults
      data {
        _id
        name
        peripheryOf
        country
        region
        peripheryOfCity {
          _id
          name
        }
        mehfils {
          _id
          name
        }
        karkunCount
        memberCount
      }
    }
  }
`;

export default PAGED_CITIES;
