import gql from 'graphql-tag';

const APPROVE_COMM_MESSAGE = gql`
  mutation approveCommMessage($_id: String!) {
    approveCommMessage(_id: $_id) {
      _id
      source
      messageBody
      status
      sentDate
      karkunIds
      approvedOn
      approvedBy
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default APPROVE_COMM_MESSAGE;
