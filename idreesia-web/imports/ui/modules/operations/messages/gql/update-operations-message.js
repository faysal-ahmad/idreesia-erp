import gql from 'graphql-tag';

const UPDATE_OPERATIONS_MESSAGE = gql`
  mutation updateOperationsMessage(
    $_id: String!
    $messageBody: String!
    $recepientFilter: MessageRecepientFilter
  ) {
    updateOperationsMessage(
      _id: $_id
      messageBody: $messageBody
      recepientFilter: $recepientFilter
    ) {
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
      approvedOn
      approvedBy
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_OPERATIONS_MESSAGE;
