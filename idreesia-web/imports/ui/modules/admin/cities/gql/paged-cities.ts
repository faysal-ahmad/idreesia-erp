import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedCitiesQuery,
  PagedCitiesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_CITIES: TypedDocumentNode<
  PagedCitiesQuery,
  PagedCitiesQueryVariables
> = gql`
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
