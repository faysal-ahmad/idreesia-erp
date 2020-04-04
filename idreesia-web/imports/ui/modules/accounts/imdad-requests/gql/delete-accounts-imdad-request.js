import gql from 'graphql-tag';

const DELETE_ACCOUNTS_IMDAD_REQUEST = gql`
  mutation deleteAccountsImdadRequest($_id: String!) {
    deleteAccountsImdadRequest(_id: $_id)
  }
`;

export default DELETE_ACCOUNTS_IMDAD_REQUEST;
