import gql from 'graphql-tag';

const PAGED_OPERATIONS_IMDAD_REQUESTS = gql`
  query pagedOperationsImdadRequests($filter: ImdadRequestFilter) {
    pagedOperationsImdadRequests(filter: $filter) {
      totalResults
      data {
        _id
        visitorId
        requestDate
        status
      }
    }
  }
`;

export default PAGED_OPERATIONS_IMDAD_REQUESTS;
