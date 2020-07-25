import gql from 'graphql-tag';

const UPDATE_OPERATIONS_IMDAD_REQUEST = gql`
  mutation updateOperationsImdadRequest(
    $_id: String!
    $status: String
    $imdadReasonId: String
    $notes: String
  ) {
    updateOperationsImdadRequest(
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

export default UPDATE_OPERATIONS_IMDAD_REQUEST;
