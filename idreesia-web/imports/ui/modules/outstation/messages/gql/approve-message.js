import gql from 'graphql-tag';

const APPROVE_MESSAGE = gql`
  mutation approveMessage($_id: String!) {
    approveMessage(_id: $_id) {
      _id
      source
      messageBody
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

export default APPROVE_MESSAGE;
