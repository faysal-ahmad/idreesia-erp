import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedFreeFormCountriesQuery,
  PagedFreeFormCountriesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_FREE_FORM_COUNTRIES: TypedDocumentNode<
  PagedFreeFormCountriesQuery,
  PagedFreeFormCountriesQueryVariables
> = gql`
  query pagedFreeFormCountries($pageIndex: Int!, $pageSize: Int!) {
    pagedFreeFormCountries(pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        name
        count
      }
    }
  }
`;

export default PAGED_FREE_FORM_COUNTRIES;
