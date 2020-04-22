import gql from 'graphql-tag';

const CREATE_OUTSTATION_MESSAGE = gql`
  mutation createOutstationMessage(
    $messageBody: String!
    $karkunFilter: MessageKarkunFilter
  ) {
    createOutstationMessage(
      messageBody: $messageBody
      karkunFilter: $karkunFilter
    ) {
      _id
      source
      messageBody
      karkunFilter {
        lastTarteeb
        dutyId
        cityId
        cityMehfilId
        region
      }
      status
      sentDate
      outstationKarkunIds
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
