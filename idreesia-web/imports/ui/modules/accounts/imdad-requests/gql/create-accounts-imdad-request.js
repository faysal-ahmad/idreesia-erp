import gql from 'graphql-tag';

const CREATE_ACCOUNTS_IMDAD_REQUEST = gql`
  mutation createAccountsImdadRequest(
    $requestDate: String!
    $visitorId: String!
    $notes: String
  ) {
    createAccountsImdadRequest(
      requestDate: $requestDate
      visitorId: $visitorId
      notes: $notes
    ) {
      _id
      visitorId
      requestDate
      status
      notes
    }
  }
`;

export default CREATE_ACCOUNTS_IMDAD_REQUEST;
