import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PreviousMonthSalariesQuery,
  PreviousMonthSalariesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PREV_MONTH_SALARIES: TypedDocumentNode<
  PreviousMonthSalariesQuery,
  PreviousMonthSalariesQueryVariables
> = gql`
  query previousMonthSalaries($month: String!, $jobId: String) {
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
