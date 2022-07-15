import gql from 'graphql-tag';

export const DELETE_OPERATIONS_WAZEEFA = gql`
  mutation deleteOperationsWazeefa($_id: String!) {
    deleteOperationsWazeefa(_id: $_id)
  }
`;
