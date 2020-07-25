import gql from 'graphql-tag';

const CREATE_OPERATIONS_IMDAD_REQUEST = gql`
  mutation createOperationsImdadRequest($visitorId: String!) {
    createOperationsImdadRequest(visitorId: $visitorId) {
      _id
      visitorId
      requestDate
      status
    }
  }
`;

export default CREATE_OPERATIONS_IMDAD_REQUEST;
