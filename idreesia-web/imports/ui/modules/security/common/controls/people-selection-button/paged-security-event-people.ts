import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedSecurityEventPeopleQuery,
  PagedSecurityEventPeopleQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

const PAGED_SECURITY_EVENT_PEOPLE: TypedDocumentNode<
  PagedSecurityEventPeopleQuery,
  PagedSecurityEventPeopleQueryVariables
> = gql`
  query pagedSecurityEventPeople(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedSecurityEventPeople(
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

/** Karkuns from any city who can be put on an event's duty. */
export const securityEventPeopleSource: PersonSearchSource<PagedSecurityEventPeopleQuery> = {
  query: PAGED_SECURITY_EVENT_PEOPLE,
  select: data => data.pagedSecurityEventPeople,
  description: 'Showing karkuns from any city.',
};

export default PAGED_SECURITY_EVENT_PEOPLE;
