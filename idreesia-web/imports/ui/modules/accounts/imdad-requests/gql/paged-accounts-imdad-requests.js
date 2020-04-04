import gql from 'graphql-tag';

const PAGED_ACCOUNTS_IMDAD_REQUESTS = gql`
  query pagedAccountsImdadRequests($filter: ImdadRequestFilter) {
    pagedAccountsImdadRequests(filter: $filter) {
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

export default PAGED_ACCOUNTS_IMDAD_REQUESTS;
