import gql from 'graphql-tag';

const UPDATE_ACCOUNTS_IMDAD_REQUEST = gql`
  mutation updateAccountsImdadRequest(
    $_id: String!
    $status: String
    $imdadReasonId: String
    $notes: String
  ) {
    updateAccountsImdadRequest(
      _id: $_id
      status: $status
      imdadReasonId: $imdadReasonId
      notes: $notes
    ) {
      _id
      requestDate
      status
      visitorId
      imdadReasonId
      notes
    }
  }
`;

export default UPDATE_ACCOUNTS_IMDAD_REQUEST;
