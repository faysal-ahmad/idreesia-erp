import gql from 'graphql-tag';

const PAGED_SALARIES_BY_KARKUN = gql`
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
