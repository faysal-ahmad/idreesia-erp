import gql from 'graphql-tag';

const PAGED_OPERATIONS_VISITOR_MULAKAATS = gql`
  query pagedOperationsVisitorMulakaats($filter: VisitorMulakaatFilter) {
    pagedOperationsVisitorMulakaats(filter: $filter) {
      totalResults
      data {
        _id
        visitorId
        mulakaatDate
        cancelledDate
      }
    }
  }
`;

export default PAGED_OPERATIONS_VISITOR_MULAKAATS;
