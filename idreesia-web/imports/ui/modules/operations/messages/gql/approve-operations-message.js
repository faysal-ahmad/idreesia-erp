import gql from 'graphql-tag';

const APPROVE_OPERATIONS_MESSAGE = gql`
  mutation approveOperationsMessage($_id: String!) {
    approveOperationsMessage(_id: $_id) {
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

export default APPROVE_OPERATIONS_MESSAGE;
