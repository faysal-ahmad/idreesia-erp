import gql from 'graphql-tag';

const MESSAGE_BY_ID = gql`
  query messageById($_id: String!) {
    messageById(_id: $_id) {
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

export default MESSAGE_BY_ID;
