import gql from 'graphql-tag';

const ACCOUNTS_IMDAD_REQUEST_BY_ID = gql`
  query accountsImdadRequestById($_id: String!) {
    accountsImdadRequestById(_id: $_id) {
      _id
      visitorId
      requestDate
      imdadReasonId
      status
      notes
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
      visitor {
        _id
        name
      }
      attachments {
        _id
        name
        description
        mimeType
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default ACCOUNTS_IMDAD_REQUEST_BY_ID;
