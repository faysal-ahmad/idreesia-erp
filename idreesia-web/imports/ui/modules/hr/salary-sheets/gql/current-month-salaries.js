import gql from 'graphql-tag';

const CURRENT_MONTH_SALARIES = gql`
  query salariesByMonth($month: String!, $jobId: String) {
    salariesByMonth(month: $month, jobId: $jobId) {
      _id
      karkunId
      month
      jobId
      salary
      openingLoan
      loanDeduction
      newLoan
      closingLoan
      otherDeduction
      arrears
      netPayment
      rashanMadad
      approvedOn
      approvedBy
      approver {
        _id
        name
      }
      karkun {
        _id
        name
        parentName
        imageId
        cnicNumber
        contactNumber1
      }
      job {
        _id
        name
      }
    }
  }
`;

export default CURRENT_MONTH_SALARIES;
