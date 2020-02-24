import gql from 'graphql-tag';

const PAGED_SECURITY_VISITOR_MULAKAATS = gql`
  query pagedSecurityVisitorMulakaats($filter: VisitorMulakaatFilter) {
    pagedSecurityVisitorMulakaats(filter: $filter) {
      totalResults
      data {
        _id
        visitorId
        mulakaatDate
        cancelledDate
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

export default PAGED_SECURITY_VISITOR_MULAKAATS;
