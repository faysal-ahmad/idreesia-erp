import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HelperPagedAdminKarkunsQuery,
  HelperPagedAdminKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_ADMIN_KARKUNS: TypedDocumentNode<
  HelperPagedAdminKarkunsQuery,
  HelperPagedAdminKarkunsQueryVariables
> = gql`
  query helperPagedAdminKarkuns($filter: AdminKarkunFilter) {
    pagedAdminKarkuns(filter: $filter) {
      totalResults
      data {
        _id
        sharedData {
          name
          cnicNumber
          contactNumber1
          contactNumber2
          imageUrl
          imageThumbnailUrl
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

export default PAGED_ADMIN_KARKUNS;
