import gql from 'graphql-tag';

const PAGED_VISITORS = gql`
  query pagedVisitors($filter: VisitorFilter) {
    pagedVisitors(filter: $filter) {
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

export default PAGED_VISITORS;
