import gql from 'graphql-tag';

const PAGED_CITIES = gql`
  query pagedCities($queryString: String) {
    pagedCities(queryString: $queryString) {
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
