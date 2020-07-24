import gql from 'graphql-tag';

const OPERATIONS_MESSAGE_BY_ID = gql`
  query operationsMessageById($_id: String!) {
    operationsMessageById(_id: $_id) {
      _id
      messageBody
      recepientFilters {
        filterTarget
        bloodGroup
        lastTarteeb
        jobIds
        dutyIds
        dutyShiftIds
      }
      status
      sentDate
      karkunIds
      approvedOn
      approvedBy
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default OPERATIONS_MESSAGE_BY_ID;
