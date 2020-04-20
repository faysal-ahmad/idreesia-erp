import gql from 'graphql-tag';

const HR_MESSAGE_BY_ID = gql`
  query hrMessageById($_id: String!) {
    hrMessageById(_id: $_id) {
      _id
      messageBody
      karkunFilters {
        filterTarget
        bloodGroup
        lastTarteeb
        jobId
        dutyId
        dutyShiftId
      }
      status
      sentDate
      msKarkunIds
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
