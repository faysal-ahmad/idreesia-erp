import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedHrKarkunsPermissionKarkunsQuery,
  PagedHrKarkunsPermissionKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

const PAGED_HR_PERMISSION_KARKUNS: TypedDocumentNode<
  PagedHrKarkunsPermissionKarkunsQuery,
  PagedHrKarkunsPermissionKarkunsQueryVariables
> = gql`
  query pagedHrKarkunsPermissionKarkuns(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedHrKarkunsPermissionKarkuns(
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
export const hrPermissionKarkunSource: PersonSearchSource<PagedHrKarkunsPermissionKarkunsQuery> = {
  query: PAGED_HR_PERMISSION_KARKUNS,
  select: data => data.pagedHrKarkunsPermissionKarkuns,
  description:
    'Showing karkuns from any city who have an active, unlocked user account.',
};

export default PAGED_HR_PERMISSION_KARKUNS;
