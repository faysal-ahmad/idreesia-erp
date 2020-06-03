import gql from 'graphql-tag';

const CREATE_COMM_MESSAGE = gql`
  mutation createCommMessage(
    $messageBody: String!
    $recepientFilter: MessageRecepientFilter
  ) {
    createCommMessage(
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
        jobIds
        dutyIds
        dutyShiftIds
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

export default CREATE_COMM_MESSAGE;
