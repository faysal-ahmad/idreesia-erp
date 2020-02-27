import gql from 'graphql-tag';

const PAGED_SECURITY_VISITORS = gql`
  query pagedSecurityVisitors($filter: VisitorFilter) {
    pagedSecurityVisitors(filter: $filter) {
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
        criminalRecord
        otherNotes
      }
    }
  }
`;

export default PAGED_SECURITY_VISITORS;
