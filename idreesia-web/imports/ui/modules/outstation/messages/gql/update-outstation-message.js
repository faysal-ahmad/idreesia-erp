import gql from 'graphql-tag';

const UPDATE_OUTSTATION_MESSAGE = gql`
  mutation updateOutstationMessage(
    $_id: String!
    $messageBody: String!
    $karkunFilter: KarkunFilter
  ) {
    updateOutstationMessage(
      _id: $_id
      messageBody: $messageBody
      karkunFilter: $karkunFilter
    ) {
      _id
      messageBody
      karkunFilter {
        dutyId
        cityId
        cityMehfilId
        region
      }
      status
      sentDate
      karkunIds
      visitorIds
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
