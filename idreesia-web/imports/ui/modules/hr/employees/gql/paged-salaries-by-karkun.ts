import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedSalariesByKarkunQuery,
  PagedSalariesByKarkunQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_SALARIES_BY_KARKUN: TypedDocumentNode<
  PagedSalariesByKarkunQuery,
  PagedSalariesByKarkunQueryVariables
> = gql`
  query pagedSalariesByKarkun($queryString: String) {
    pagedSalariesByKarkun(queryString: $queryString) {
      totalResults
      salaries {
        _id
        month
        salary
        rashanMadad
        openingLoan
        loanDeduction
        newLoan
        closingLoan
        otherDeduction
        arrears
        netPayment
      }
    }
  }
`;

export default PAGED_SALARIES_BY_KARKUN;
