import gql from 'graphql-tag';

const DELETE_OPERATIONS_IMDAD_REQUEST = gql`
  mutation deleteOperationsImdadRequest($_id: String!) {
    deleteOperationsImdadRequest(_id: $_id)
  }
`;

export default DELETE_OPERATIONS_IMDAD_REQUEST;
