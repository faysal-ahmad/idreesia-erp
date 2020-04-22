import gql from 'graphql-tag';

const APPROVE_OUTSTATION_MESSAGE = gql`
  mutation approveOutstationMessage($_id: String!) {
    approveOutstationMessage(_id: $_id) {
      _id
      source
      messageBody
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

export default APPROVE_OUTSTATION_MESSAGE;
