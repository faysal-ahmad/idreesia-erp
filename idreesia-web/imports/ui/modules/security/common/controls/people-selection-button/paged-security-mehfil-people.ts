import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedSecurityMehfilPeopleQuery,
  PagedSecurityMehfilPeopleQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

const PAGED_SECURITY_MEHFIL_PEOPLE: TypedDocumentNode<
  PagedSecurityMehfilPeopleQuery,
  PagedSecurityMehfilPeopleQueryVariables
> = gql`
  query pagedSecurityMehfilPeople(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedSecurityMehfilPeople(
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

/** Anyone who can be put on a mehfil's duty. */
export const securityMehfilPeopleSource: PersonSearchSource<PagedSecurityMehfilPeopleQuery> = {
  query: PAGED_SECURITY_MEHFIL_PEOPLE,
  select: data => data.pagedSecurityMehfilPeople,
  description: 'Showing everyone (visitors, karkuns and employees) from any city.',
};

export default PAGED_SECURITY_MEHFIL_PEOPLE;
