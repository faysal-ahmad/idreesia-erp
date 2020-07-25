import gql from 'graphql-tag';

const SET_OPERATIONS_APPROVED_IMDAD = gql`
  mutation setOperationsApprovedImdad(
    $_id: String!
    $approvedImdad: ApprovedImdad!
  ) {
    setOperationsApprovedImdad(_id: $_id, approvedImdad: $approvedImdad) {
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

export default SET_OPERATIONS_APPROVED_IMDAD;
