import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedHrReportsToKarkunsQuery,
  PagedHrReportsToKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

const PAGED_HR_REPORTS_TO_KARKUNS: TypedDocumentNode<
  PagedHrReportsToKarkunsQuery,
  PagedHrReportsToKarkunsQueryVariables
> = gql`
  query pagedHrReportsToKarkuns(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedHrReportsToKarkuns(
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

/** Karkuns of Multan, to pick whom an employee reports to. */
export const hrReportsToSource: PersonSearchSource<PagedHrReportsToKarkunsQuery> = {
  query: PAGED_HR_REPORTS_TO_KARKUNS,
  select: data => data.pagedHrReportsToKarkuns,
  description: 'Showing karkuns of Multan.',
};

export default PAGED_HR_REPORTS_TO_KARKUNS;
