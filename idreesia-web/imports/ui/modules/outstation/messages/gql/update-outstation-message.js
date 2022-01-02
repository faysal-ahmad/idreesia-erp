import gql from 'graphql-tag';

const UPDATE_OUTSTATION_MESSAGE = gql`
  mutation updateOutstationMessage(
    $_id: String!
    $messageBody: String!
    $recepientFilter: MessageRecepientFilter
  ) {
    updateOutstationMessage(
      _id: $_id
      messageBody: $messageBody
      recepientFilter: $recepientFilter
    ) {
      _id
      messageBody
      recepientFilters {
        lastTarteeb
        dutyIds
        cityId
        cityMehfilId
        region
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

export default UPDATE_OUTSTATION_MESSAGE;
