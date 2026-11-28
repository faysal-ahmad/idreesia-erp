import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedHrPickerKarkunsQuery,
  PagedHrPickerKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  PICKER_PERSON_FIELDS,
  type PersonSearchSource,
} from '/imports/ui/modules/helpers/controls/person-picker';

const PAGED_HR_PICKER_KARKUNS: TypedDocumentNode<
  PagedHrPickerKarkunsQuery,
  PagedHrPickerKarkunsQueryVariables
> = gql`
  query pagedHrPickerKarkuns(
    $name: String
    $cnicNumber: String
    $phoneNumber: String
    $pageIndex: String
    $pageSize: String
  ) {
    pagedHrPickerKarkuns(
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

/** Karkuns of Multan, to add to a team or a day's duty. */
export const hrPickerKarkunSource: PersonSearchSource<PagedHrPickerKarkunsQuery> = {
  query: PAGED_HR_PICKER_KARKUNS,
  select: data => data.pagedHrPickerKarkuns,
  description: 'Showing karkuns of Multan.',
};

export default PAGED_HR_PICKER_KARKUNS;
