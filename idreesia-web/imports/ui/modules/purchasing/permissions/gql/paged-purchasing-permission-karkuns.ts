import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedPurchasingPermissionKarkunsQuery,
  PagedPurchasingPermissionKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

const PAGED_PURCHASING_PERMISSION_KARKUNS: TypedDocumentNode<
  PagedPurchasingPermissionKarkunsQuery,
  PagedPurchasingPermissionKarkunsQueryVariables
> = gql`
  query pagedPurchasingPermissionKarkuns(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedPurchasingPermissionKarkuns(
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

/** The karkuns the Add User drawers of this page can pick from. */
export const purchasingPermissionKarkunSource: PersonSearchSource<PagedPurchasingPermissionKarkunsQuery> = {
  query: PAGED_PURCHASING_PERMISSION_KARKUNS,
  select: data => data.pagedPurchasingPermissionKarkuns,
  description:
    'Showing karkuns of Multan (the Purchasing city) who have an active, unlocked user account.',
};

export default PAGED_PURCHASING_PERMISSION_KARKUNS;
