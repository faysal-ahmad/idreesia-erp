import gql from 'graphql-tag';

const CREATE_MESSAGE = gql`
  mutation createMessage(
    $source: String!
    $messageBody: String!
    $karkunFilter: KarkunFilterInput
  ) {
    createMessage(
      source: $source
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

export default CREATE_MESSAGE;
