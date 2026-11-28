import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedStorePermissionKarkunsQuery,
  PagedStorePermissionKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

const PAGED_STORE_PERMISSION_KARKUNS: TypedDocumentNode<
  PagedStorePermissionKarkunsQuery,
  PagedStorePermissionKarkunsQueryVariables
> = gql`
  query pagedStorePermissionKarkuns(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedStorePermissionKarkuns(
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
export const storePermissionKarkunSource: PersonSearchSource<PagedStorePermissionKarkunsQuery> = {
  query: PAGED_STORE_PERMISSION_KARKUNS,
  select: data => data.pagedStorePermissionKarkuns,
  description: 'Showing karkuns from Multan who have an active, unlocked user account.',
};

export default PAGED_STORE_PERMISSION_KARKUNS;
