import gql from 'graphql-tag';

const HR_MESSAGE_BY_ID = gql`
  query hrMessageById($_id: String!) {
    hrMessageById(_id: $_id) {
      _id
      messageBody
      recepientFilters {
        filterTarget
        bloodGroup
        lastTarteeb
        jobId
        dutyId
        dutyShiftId
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

export default HR_MESSAGE_BY_ID;
