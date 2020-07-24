import gql from 'graphql-tag';

const DELETE_OPERATIONS_WAZEEFA = gql`
  mutation deleteOperationsWazeefa($_id: String!) {
    deleteOperationsWazeefa(_id: $_id)
  }
`;

export default DELETE_OPERATIONS_WAZEEFA;
