import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedPurchasingKarkunsQuery,
  PagedPurchasingKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

const PAGED_PURCHASING_KARKUNS: TypedDocumentNode<
  PagedPurchasingKarkunsQuery,
  PagedPurchasingKarkunsQueryVariables
> = gql`
  query pagedPurchasingKarkuns(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedPurchasingKarkuns(
      name: $name
      cnicNumber: $cnicNumber
      phoneNumber: $phoneNumber
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

/** Karkuns of the Purchasing city, to name who requested or received goods. */
export const purchasingKarkunSource: PersonSearchSource<PagedPurchasingKarkunsQuery> = {
  query: PAGED_PURCHASING_KARKUNS,
  select: data => data.pagedPurchasingKarkuns,
  description:
    'Showing karkuns of Multan (the Purchasing city), with or without a user account.',
};

export default PAGED_PURCHASING_KARKUNS;
