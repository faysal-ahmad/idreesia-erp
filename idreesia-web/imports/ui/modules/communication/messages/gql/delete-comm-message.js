import gql from 'graphql-tag';

const DELETE_COMM_MESSAGE = gql`
  mutation deleteCommMessage($_id: String!) {
    deleteCommMessage(_id: $_id)
  }
`;

export default DELETE_COMM_MESSAGE;
