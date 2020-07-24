import gql from 'graphql-tag';

const DELETE_OPERATIONS_MESSAGE = gql`
  mutation deleteOperationsMessage($_id: String!) {
    deleteOperationsMessage(_id: $_id)
  }
`;

export default DELETE_OPERATIONS_MESSAGE;
