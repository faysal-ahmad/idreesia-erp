import gql from 'graphql-tag';

const DELETE_WAZEEFA = gql`
  mutation deleteWazeefa($_id: String!) {
    deleteWazeefa(_id: $_id)
  }
`;

export default DELETE_WAZEEFA;
