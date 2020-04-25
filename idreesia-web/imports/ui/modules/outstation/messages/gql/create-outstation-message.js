import gql from 'graphql-tag';

const CREATE_OUTSTATION_MESSAGE = gql`
  mutation createOutstationMessage(
    $messageBody: String!
    $recepientFilter: MessageRecepientFilter
  ) {
    createOutstationMessage(
      messageBody: $messageBody
      recepientFilter: $recepientFilter
    ) {
      _id
      source
      messageBody
      recepientFilters {
        lastTarteeb
        dutyId
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

export default CREATE_OUTSTATION_MESSAGE;
