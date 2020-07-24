import gql from 'graphql-tag';

const PAGED_OPERATIONS_VISITORS = gql`
  query pagedOperationsVisitors($filter: VisitorFilter) {
    pagedOperationsVisitors(filter: $filter) {
      totalResults
      data {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber2
        city
        country
        imageId
      }
    }
  }
`;

export default PAGED_OPERATIONS_VISITORS;
