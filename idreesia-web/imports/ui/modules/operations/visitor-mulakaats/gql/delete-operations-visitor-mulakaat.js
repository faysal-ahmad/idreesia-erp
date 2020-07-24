import gql from 'graphql-tag';

const DELETE_OPERATIONS_VISITOR_MULAKAAT = gql`
  mutation deleteOperationsVisitorMulakaat($_id: String!) {
    deleteOperationsVisitorMulakaat(_id: $_id)
  }
`;

export default DELETE_OPERATIONS_VISITOR_MULAKAAT;
