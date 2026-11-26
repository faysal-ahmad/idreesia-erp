import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedHrKarkunCandidatePeopleQuery,
  PagedHrKarkunCandidatePeopleQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

const PAGED_HR_KARKUN_CANDIDATE_PEOPLE: TypedDocumentNode<
  PagedHrKarkunCandidatePeopleQuery,
  PagedHrKarkunCandidatePeopleQueryVariables
> = gql`
  query pagedHrKarkunCandidatePeople(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedHrKarkunCandidatePeople(
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

/** People who are not karkuns yet. */
export const hrKarkunCandidateSource: PersonSearchSource<PagedHrKarkunCandidatePeopleQuery> = {
  query: PAGED_HR_KARKUN_CANDIDATE_PEOPLE,
  select: data => data.pagedHrKarkunCandidatePeople,
  description:
    'Showing people from any city who are not karkuns yet (visitors and employees).',
};

export default PAGED_HR_KARKUN_CANDIDATE_PEOPLE;
