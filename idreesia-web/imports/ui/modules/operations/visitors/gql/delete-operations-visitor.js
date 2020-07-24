import gql from 'graphql-tag';

const DELETE_OPERATIONS_VISITOR = gql`
  mutation deleteOperationsVisitor($_id: String!) {
    deleteOperationsVisitor(_id: $_id)
  }
`;

export default DELETE_OPERATIONS_VISITOR;
