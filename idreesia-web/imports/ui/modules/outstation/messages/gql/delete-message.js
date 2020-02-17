import gql from 'graphql-tag';

const DELETE_MESSAGE = gql`
  mutation deleteMessage($_id: String!) {
    deleteMessage(_id: $_id)
  }
`;

export default DELETE_MESSAGE;
