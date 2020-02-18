import gql from 'graphql-tag';

const SET_KARKUN_EMPLOYMENT_INFO = gql`
  mutation setKarkunEmploymentInfo(
    $_id: String!
    $isEmployee: Boolean!
    $jobId: String
    $employmentStartDate: String
    $employmentEndDate: String
  ) {
    setKarkunEmploymentInfo(
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
export default SET_KARKUN_EMPLOYMENT_INFO;
