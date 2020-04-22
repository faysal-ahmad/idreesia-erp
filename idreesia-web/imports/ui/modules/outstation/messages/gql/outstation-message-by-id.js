import gql from 'graphql-tag';

const OUTSTATION_MESSAGE_BY_ID = gql`
  query outstationMessageById($_id: String!) {
    outstationMessageById(_id: $_id) {
      _id
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

export default OUTSTATION_MESSAGE_BY_ID;
