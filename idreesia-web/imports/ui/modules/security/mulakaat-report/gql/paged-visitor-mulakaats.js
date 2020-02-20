import gql from 'graphql-tag';

const PAGED_VISITOR_MULAKAATS = gql`
  query pagedVisitorMulakaats($filter: VisitorMulakaatFilter) {
    pagedVisitorMulakaats(filter: $filter) {
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

export default PAGED_VISITOR_MULAKAATS;
