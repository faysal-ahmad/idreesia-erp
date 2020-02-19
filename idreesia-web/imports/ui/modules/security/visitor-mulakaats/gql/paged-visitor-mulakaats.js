import gql from 'graphql-tag';

const PAGED_VISITOR_MULAKAATS = gql`
  query pagedVisitorMulakaats($filter: VisitorMulakaatFilter) {
    pagedVisitorMulakaats(filter: $filter) {
      totalResults
      data {
        _id
        visitorId
        mulakaatDate
      }
    }
  }
`;

export default PAGED_VISITOR_MULAKAATS;
