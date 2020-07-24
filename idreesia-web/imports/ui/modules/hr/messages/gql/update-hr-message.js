import gql from 'graphql-tag';

const UPDATE_HR_MESSAGE = gql`
  mutation updateHrMessage(
    $_id: String!
    $messageBody: String!
    $recepientFilter: MessageRecepientFilter
  ) {
    updateHrMessage(
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

export default UPDATE_HR_MESSAGE;
