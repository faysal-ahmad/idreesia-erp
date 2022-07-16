import gql from 'graphql-tag';

const REMOVE_IMDAD_REASON = gql`
  mutation removeImdadReason($_id: String!) {
    removeImdadReason(_id: $_id)
  }
`;

export default REMOVE_IMDAD_REASON;
