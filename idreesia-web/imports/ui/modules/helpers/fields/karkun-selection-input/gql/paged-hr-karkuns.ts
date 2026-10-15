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
          teams {
            _id
            name
            duty {
              _id
              name
            }
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
