import gql from 'graphql-tag';

const PREV_MONTH_SALARIES = gql`
  query salariesByMonth($month: String!, $jobId: String) {
    salariesByMonth(month: $month, jobId: $jobId) {
      _id
      karkunId
      month
      jobId
      salary
      otherDeduction
      arrears
      rashanMadad
    }
  }
`;

export default PREV_MONTH_SALARIES;
