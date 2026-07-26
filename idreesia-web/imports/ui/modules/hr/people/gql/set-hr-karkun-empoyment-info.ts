import gql from 'graphql-tag';

const SET_HR_KARKUN_EMPLOYMENT_INFO = gql`
  mutation setHrKarkunEmploymentInfo(
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
