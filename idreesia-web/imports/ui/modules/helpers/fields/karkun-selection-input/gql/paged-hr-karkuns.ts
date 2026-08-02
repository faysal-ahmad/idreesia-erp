import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HelperPagedHrKarkunsQuery,
  HelperPagedHrKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_HR_KARKUNS: TypedDocumentNode<
  HelperPagedHrKarkunsQuery,
  HelperPagedHrKarkunsQueryVariables
> = gql`
  query helperPagedHrKarkuns($filter: KarkunFilter) {
    pagedHrKarkuns(filter: $filter) {
      totalResults
      karkuns {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber1Subscribed
        contactNumber2
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
