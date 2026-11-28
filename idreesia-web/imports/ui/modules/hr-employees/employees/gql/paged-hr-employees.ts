import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedHrEmployeesQuery,
  PagedHrEmployeesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_HR_EMPLOYEES: TypedDocumentNode<
  PagedHrEmployeesQuery,
  PagedHrEmployeesQueryVariables
> = gql`
  query pagedHrEmployees($filter: HrEmployeeFilter) {
    pagedHrEmployees(filter: $filter) {
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
        }
        employeeData {
          jobId
          employmentStatus
          employmentStartDate
          employmentEndDate
          probationEndDate
          job {
            _id
            name
          }
          jobShift {
            _id
            name
          }
          reportsTo {
            _id
            sharedData {
              name
            }
          }
        }
      }
    }
  }
`;

export default PAGED_HR_EMPLOYEES;
