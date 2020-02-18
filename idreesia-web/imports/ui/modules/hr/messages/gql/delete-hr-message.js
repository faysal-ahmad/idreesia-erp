import gql from 'graphql-tag';

const DELETE_HR_MESSAGE = gql`
  mutation deleteHrMessage($_id: String!) {
    deleteHrMessage(_id: $_id)
  }
`;

export default DELETE_HR_MESSAGE;
