import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedStoreKarkunsQuery,
  PagedStoreKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

const PAGED_STORE_KARKUNS: TypedDocumentNode<
  PagedStoreKarkunsQuery,
  PagedStoreKarkunsQueryVariables
> = gql`
  query pagedStoreKarkuns(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $predefinedFilterName: String
    $predefinedFilterStoreId: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedStoreKarkuns(
      name: $name
      cnicNumber: $cnicNumber
      phoneNumber: $phoneNumber
      predefinedFilterName: $predefinedFilterName
      predefinedFilterStoreId: $predefinedFilterStoreId
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        ...PickerPersonFields
      }
    }
  }
  ${PICKER_PERSON_FIELDS}
`;

/** People to name on a store form; set variables.predefinedFilterName for a "recently used" list. */
export const storeKarkunSource: PersonSearchSource<PagedStoreKarkunsQuery> = {
  query: PAGED_STORE_KARKUNS,
  select: data => data.pagedStoreKarkuns,
  description: 'Showing karkuns of Multan, including those who are also employees.',
};

export default PAGED_STORE_KARKUNS;
