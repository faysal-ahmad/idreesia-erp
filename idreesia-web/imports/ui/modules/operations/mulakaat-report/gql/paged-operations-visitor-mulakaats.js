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
        cancelledByName
        createdByName
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

export default PAGED_OPERATIONS_VISITOR_MULAKAATS;
