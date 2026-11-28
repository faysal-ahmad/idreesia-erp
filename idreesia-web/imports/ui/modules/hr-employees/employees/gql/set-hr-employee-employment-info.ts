import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetHrEmployeeEmploymentInfoMutation,
  SetHrEmployeeEmploymentInfoMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

// The directly editable employment fields. Status and job change through the
// lifecycle mutations in ./employment-lifecycle.
const SET_HR_EMPLOYEE_EMPLOYMENT_INFO: TypedDocumentNode<
  SetHrEmployeeEmploymentInfoMutation,
  SetHrEmployeeEmploymentInfoMutationVariables
> = gql`
  mutation setHrEmployeeEmploymentInfo(
    $_id: String!
    $employmentStartDate: String
    $employmentEndDate: String
    $probationEndDate: String
    $confirmationDate: String
    $bankAccountDetails: String
    $jobShiftId: String
    $workingDays: [String]
    $reportsToPersonId: String
  ) {
    setHrEmployeeEmploymentInfo(
      _id: $_id
      employmentStartDate: $employmentStartDate
      employmentEndDate: $employmentEndDate
      probationEndDate: $probationEndDate
      confirmationDate: $confirmationDate
      bankAccountDetails: $bankAccountDetails
      jobShiftId: $jobShiftId
      workingDays: $workingDays
      reportsToPersonId: $reportsToPersonId
    ) {
      _id
    }
  }
`;
export default SET_HR_EMPLOYEE_EMPLOYMENT_INFO;
