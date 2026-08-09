import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetPeopleKarkunEmploymentInfoMutation,
  SetPeopleKarkunEmploymentInfoMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_HR_KARKUN_EMPLOYMENT_INFO: TypedDocumentNode<
  SetPeopleKarkunEmploymentInfoMutation,
  SetPeopleKarkunEmploymentInfoMutationVariables
> = gql`
  mutation setPeopleKarkunEmploymentInfo(
    $_id: String!
    $isEmployee: Boolean!
    $jobId: String
    $employmentStartDate: String
    $employmentEndDate: String
  ) {
    setHrKarkunEmploymentInfo(
      _id: $_id
      isEmployee: $isEmployee
      jobId: $jobId
      employmentStartDate: $employmentStartDate
      employmentEndDate: $employmentEndDate
    ) {
      _id
      isEmployee
      jobId
      employmentStartDate
      employmentEndDate
    }
  }
`;
export default SET_HR_KARKUN_EMPLOYMENT_INFO;
