import gql from 'graphql-tag';

const UPDATE_SALARY = gql`
  mutation updateSalary(
    $_id: String!
    $salary: Int
    $openingLoan: Int
    $loanDeduction: Int
    $newLoan: Int
    $otherDeduction: Int
    $arrears: Int
    $rashanMadad: Int
  ) {
    updateSalary(
      _id: $_id
      salary: $salary
      openingLoan: $openingLoan
      loanDeduction: $loanDeduction
      newLoan: $newLoan
      otherDeduction: $otherDeduction
      arrears: $arrears
      rashanMadad: $rashanMadad
    ) {
      _id
      karkunId
      jobId
      month
      salary
      openingLoan
      loanDeduction
      newLoan
      closingLoan
      otherDeduction
      arrears
      netPayment
      rashanMadad
    }
  }
`;

export default UPDATE_SALARY;
