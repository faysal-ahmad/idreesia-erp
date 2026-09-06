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
      data {
        _id
        sharedData {
          name
          cnicNumber
          contactNumber1
          contactNumber2
          imageId
          imageThumbnailId
        }
        karkunData {
          lastTarteebDate
          duties {
            _id
            dutyId
            shiftId
            dutyName
            shiftName
            role
          }
        }
        employeeData {
          job {
            _id
            name
          }
        }
      }
    }
  }
`;

export default PAGED_HR_KARKUNS;
