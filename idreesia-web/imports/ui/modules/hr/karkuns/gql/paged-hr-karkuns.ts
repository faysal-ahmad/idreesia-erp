import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HrKarkunsPagedHrKarkunsQuery,
  HrKarkunsPagedHrKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_HR_KARKUNS: TypedDocumentNode<
  HrKarkunsPagedHrKarkunsQuery,
  HrKarkunsPagedHrKarkunsQueryVariables
> = gql`
  query hrKarkunsPagedHrKarkuns($filter: KarkunFilter) {
    pagedHrKarkuns(filter: $filter) {
      totalResults
      karkuns {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber2
        contactNumber1Subscribed
        contactNumber2Subscribed
        lastTarteebDate
        imageId
        job {
          _id
          name
        }
        duties {
          _id
          dutyId
          shiftId
          dutyName
          shiftName
          role
        }
      }
    }
  }
`;

export default PAGED_HR_KARKUNS;
