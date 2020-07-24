import gql from 'graphql-tag';

const CREATE_OPERATIONS_MESSAGE = gql`
  mutation createOperationsMessage(
    $messageBody: String!
    $recepientFilter: MessageRecepientFilter
  ) {
    createOperationsMessage(
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

export default CREATE_OPERATIONS_MESSAGE;
