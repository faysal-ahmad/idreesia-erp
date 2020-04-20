import gql from 'graphql-tag';

const UPDATE_HR_MESSAGE = gql`
  mutation updateHrMessage(
    $_id: String!
    $messageBody: String!
    $karkunFilter: MessageKarkunFilter
  ) {
    updateHrMessage(
      _id: $_id
      messageBody: $messageBody
      karkunFilter: $karkunFilter
    ) {
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
      approvedOn
      approvedBy
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_HR_MESSAGE;
