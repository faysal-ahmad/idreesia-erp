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
        visitor {
          _id
          name
          cnicNumber
          contactNumber1
          city
          country
          imageId
        }
      }
    }
  }
`;

export default PAGED_OPERATIONS_IMDAD_REQUESTS;
