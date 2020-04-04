import gql from 'graphql-tag';

const UPDATE_ACCOUNTS_IMDAD_REQUEST = gql`
  mutation updateAccountsImdadRequest(
    $_id: String!
    $status: String
    $notes: String
  ) {
    updateAccountsImdadRequest(_id: $_id, status: $status, notes: $notes) {
      _id
      requestDate
      status
      visitorId
      notes
    }
  }
`;

export default UPDATE_ACCOUNTS_IMDAD_REQUEST;
