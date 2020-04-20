import gql from 'graphql-tag';

const CREATE_HR_MESSAGE = gql`
  mutation createHrMessage(
    $messageBody: String!
    $karkunFilter: MessageKarkunFilter
  ) {
    createHrMessage(messageBody: $messageBody, karkunFilter: $karkunFilter) {
      _id
      source
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
      approvedOn
      approvedBy
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default CREATE_HR_MESSAGE;
