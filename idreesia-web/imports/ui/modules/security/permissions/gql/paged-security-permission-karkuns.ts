import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedSecurityPermissionKarkunsQuery,
  PagedSecurityPermissionKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

const PAGED_SECURITY_PERMISSION_KARKUNS: TypedDocumentNode<
  PagedSecurityPermissionKarkunsQuery,
  PagedSecurityPermissionKarkunsQueryVariables
> = gql`
  query pagedSecurityPermissionKarkuns(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedSecurityPermissionKarkuns(
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
export const securityPermissionKarkunSource: PersonSearchSource<PagedSecurityPermissionKarkunsQuery> = {
  query: PAGED_SECURITY_PERMISSION_KARKUNS,
  select: data => data.pagedSecurityPermissionKarkuns,
  description:
    'Showing karkuns from Multan who have an active, unlocked user account.',
};

export default PAGED_SECURITY_PERMISSION_KARKUNS;
