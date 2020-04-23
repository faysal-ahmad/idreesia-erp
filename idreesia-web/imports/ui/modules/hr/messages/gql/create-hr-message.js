import gql from 'graphql-tag';

const CREATE_HR_MESSAGE = gql`
  mutation createHrMessage(
    $messageBody: String!
    $recepientFilter: MessageRecepientFilter
  ) {
    createHrMessage(
      messageBody: $messageBody
      recepientFilter: $recepientFilter
    ) {
      _id
      source
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
