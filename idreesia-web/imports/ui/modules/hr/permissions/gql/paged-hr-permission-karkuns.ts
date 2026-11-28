import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedHrPermissionKarkunsQuery,
  PagedHrPermissionKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

const PAGED_HR_PERMISSION_KARKUNS: TypedDocumentNode<
  PagedHrPermissionKarkunsQuery,
  PagedHrPermissionKarkunsQueryVariables
> = gql`
  query pagedHrPermissionKarkuns(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedHrPermissionKarkuns(
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
export const hrPermissionKarkunSource: PersonSearchSource<PagedHrPermissionKarkunsQuery> = {
  query: PAGED_HR_PERMISSION_KARKUNS,
  select: data => data.pagedHrPermissionKarkuns,
  description:
    'Showing karkuns from any city who have an active, unlocked user account.',
};

export default PAGED_HR_PERMISSION_KARKUNS;
