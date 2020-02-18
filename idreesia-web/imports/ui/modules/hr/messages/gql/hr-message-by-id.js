import gql from 'graphql-tag';

const HR_MESSAGE_BY_ID = gql`
  query hrMessageById($_id: String!) {
    hrMessageById(_id: $_id) {
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

export default HR_MESSAGE_BY_ID;
