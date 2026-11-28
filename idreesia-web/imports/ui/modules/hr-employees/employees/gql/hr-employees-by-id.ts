import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HrEmployeesByIdQuery,
  HrEmployeesByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const HR_EMPLOYEES_BY_ID: TypedDocumentNode<
  HrEmployeesByIdQuery,
  HrEmployeesByIdQueryVariables
> = gql`
  query hrEmployeesById($_ids: String!) {
    hrEmployeesById(_ids: $_ids) {
      _id
      sharedData {
        name
        parentName
        cnicNumber
        imageUrl
        contactNumber1
        contactNumber2
        imageThumbnailUrl
      }
      employeeData {
        employmentStatus
        employmentStartDate
        probationEndDate
        job {
          _id
          name
        }
        jobShift {
          _id
          name
          startTime
          endTime
        }
      }
    }
  }
`;

export default HR_EMPLOYEES_BY_ID;
