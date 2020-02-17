import gql from 'graphql-tag';

const UPDATE_MESSAGE = gql`
  mutation updateMessage(
    $_id: String!
    $messageBody: String!
    $karkunFilter: KarkunFilterInput
  ) {
    updateMessage(
      _id: $_id
      messageBody: $messageBody
      karkunFilter: $karkunFilter
    ) {
      _id
      source
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

export default UPDATE_MESSAGE;
