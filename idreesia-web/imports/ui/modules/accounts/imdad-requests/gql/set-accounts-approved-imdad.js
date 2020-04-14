import gql from 'graphql-tag';

const SET_ACCOUNTS_APPROVED_IMDAD = gql`
  mutation setAccountsApprovedImdad(
    $_id: String!
    $approvedImdad: ApprovedImdad!
  ) {
    setAccountsApprovedImdad(_id: $_id, approvedImdad: $approvedImdad) {
      _id
      approvedImdad {
        fromMonth
        toMonth
        oneOffMedical
        oneOffHouseConstruction
        oneOffMarriageExpense
        oneOffMiscPayment
        fixedRecurringWeeklyPayment
        fixedRecurringMonthlyPayment
        fixedRecurringHouseRent
        ration
        fixedRecurringMedical
        fixedRecurringSchoolFee
        fixedRecurringMilk
        fixedRecurringFuel
        variableRecurringMedical
        variableRecurringUtilityBills
      }
    }
  }
`;

export default SET_ACCOUNTS_APPROVED_IMDAD;
