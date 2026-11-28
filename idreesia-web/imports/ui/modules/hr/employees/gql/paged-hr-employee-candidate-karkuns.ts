import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedHrEmployeeCandidateKarkunsQuery,
  PagedHrEmployeeCandidateKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

const PAGED_HR_EMPLOYEE_CANDIDATE_KARKUNS: TypedDocumentNode<
  PagedHrEmployeeCandidateKarkunsQuery,
  PagedHrEmployeeCandidateKarkunsQueryVariables
> = gql`
  query pagedHrEmployeeCandidateKarkuns(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedHrEmployeeCandidateKarkuns(
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

/** Karkuns of Multan who are not employees yet. */
export const hrEmployeeCandidateSource: PersonSearchSource<PagedHrEmployeeCandidateKarkunsQuery> = {
  query: PAGED_HR_EMPLOYEE_CANDIDATE_KARKUNS,
  select: data => data.pagedHrEmployeeCandidateKarkuns,
  description: 'Showing karkuns of Multan who are not employees yet.',
};

export default PAGED_HR_EMPLOYEE_CANDIDATE_KARKUNS;
