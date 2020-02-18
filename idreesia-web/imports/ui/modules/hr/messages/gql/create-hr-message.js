import gql from 'graphql-tag';

const CREATE_HR_MESSAGE = gql`
  mutation createHrMessage($messageBody: String!, $karkunFilter: KarkunFilter) {
    createHrMessage(messageBody: $messageBody, karkunFilter: $karkunFilter) {
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

export default CREATE_HR_MESSAGE;
