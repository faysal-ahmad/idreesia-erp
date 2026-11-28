import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedAdminUserKarkunsQuery,
  PagedAdminUserKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

const PAGED_ADMIN_USER_KARKUNS: TypedDocumentNode<
  PagedAdminUserKarkunsQuery,
  PagedAdminUserKarkunsQueryVariables
> = gql`
  query pagedAdminUserKarkuns(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedAdminUserKarkuns(
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

/** Karkuns and employees a user account can be linked to. */
export const adminUserKarkunSource: PersonSearchSource<PagedAdminUserKarkunsQuery> = {
  query: PAGED_ADMIN_USER_KARKUNS,
  select: data => data.pagedAdminUserKarkuns,
  description: 'Showing karkuns and employees from any city.',
};

export default PAGED_ADMIN_USER_KARKUNS;
