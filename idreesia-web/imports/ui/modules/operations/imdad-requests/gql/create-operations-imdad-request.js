import gql from 'graphql-tag';

const CREATE_OPERATIONS_IMDAD_REQUEST = gql`
  mutation createOperationsImdadRequest(
    $requestDate: String!
    $visitorId: String!
    $imdadReasonId: String
    $notes: String
  ) {
    createOperationsImdadRequest(
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

export default CREATE_OPERATIONS_IMDAD_REQUEST;
