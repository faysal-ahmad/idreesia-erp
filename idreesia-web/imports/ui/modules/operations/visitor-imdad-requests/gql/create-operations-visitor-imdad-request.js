import gql from 'graphql-tag';

const CREATE_OPERATIONS_VISITOR_IMDAD_REQUEST = gql`
  mutation createOperationsVisitorImdadRequest($visitorId: String!) {
    createOperationsVisitorImdadRequest(visitorId: $visitorId) {
      _id
      visitorId
      requestDate
      status
    }
  }
`;

export default CREATE_OPERATIONS_VISITOR_IMDAD_REQUEST;
