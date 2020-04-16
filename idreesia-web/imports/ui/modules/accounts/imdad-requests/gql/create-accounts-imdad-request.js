import gql from 'graphql-tag';

const CREATE_ACCOUNTS_IMDAD_REQUEST = gql`
  mutation createAccountsImdadRequest(
    $requestDate: String!
    $visitorId: String!
    $imdadReasonId: String
    $notes: String
  ) {
    createAccountsImdadRequest(
      requestDate: $requestDate
      visitorId: $visitorId
      imdadReasonId: $imdadReasonId
      notes: $notes
    ) {
      _id
      visitorId
      requestDate
      imdadReasonId
      status
      notes
    }
  }
`;

export default CREATE_ACCOUNTS_IMDAD_REQUEST;
