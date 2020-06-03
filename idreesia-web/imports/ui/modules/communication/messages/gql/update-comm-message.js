import gql from 'graphql-tag';

const UPDATE_COMM_MESSAGE = gql`
  mutation updateCommMessage(
    $_id: String!
    $messageBody: String!
    $recepientFilter: MessageRecepientFilter
  ) {
    updateCommMessage(
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

export default UPDATE_COMM_MESSAGE;
