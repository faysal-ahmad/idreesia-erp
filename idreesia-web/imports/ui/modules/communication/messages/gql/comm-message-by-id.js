import gql from 'graphql-tag';

const COMM_MESSAGE_BY_ID = gql`
  query commMessageById($_id: String!) {
    commMessageById(_id: $_id) {
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

export default COMM_MESSAGE_BY_ID;
