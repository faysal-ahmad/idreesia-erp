import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CurrentMonthSalariesQuery,
  CurrentMonthSalariesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CURRENT_MONTH_SALARIES: TypedDocumentNode<
  CurrentMonthSalariesQuery,
  CurrentMonthSalariesQueryVariables
> = gql`
  query currentMonthSalaries($month: String!, $jobId: String) {
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
        bankAccountDetails
      }
      job {
        _id
        name
      }
    }
  }
`;

export default CURRENT_MONTH_SALARIES;
