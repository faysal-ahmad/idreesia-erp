import gql from 'graphql-tag';

const UPDATE_HR_MESSAGE = gql`
  mutation updateHrMessage(
    $_id: String!
    $messageBody: String!
    $karkunFilter: KarkunFilter
  ) {
    updateHrMessage(
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

export default UPDATE_HR_MESSAGE;
