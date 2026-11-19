import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedFreeFormCitiesQuery,
  PagedFreeFormCitiesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_FREE_FORM_CITIES: TypedDocumentNode<
  PagedFreeFormCitiesQuery,
  PagedFreeFormCitiesQueryVariables
> = gql`
  query pagedFreeFormCities($pageIndex: Int!, $pageSize: Int!) {
    pagedFreeFormCities(pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        name
        count
        locationId
        locationName
      }
    }
  }
`;

export default PAGED_FREE_FORM_CITIES;
