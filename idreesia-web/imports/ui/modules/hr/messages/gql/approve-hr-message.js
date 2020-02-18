import gql from 'graphql-tag';

const APPROVE_HR_MESSAGE = gql`
  mutation approveHrMessage($_id: String!) {
    approveHrMessage(_id: $_id) {
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

export default APPROVE_HR_MESSAGE;
