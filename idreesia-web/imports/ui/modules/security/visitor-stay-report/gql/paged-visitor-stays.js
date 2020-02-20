import gql from 'graphql-tag';

const PAGED_VISITOR_STAYS = gql`
  query pagedVisitorStays($queryString: String!) {
    pagedVisitorStays(queryString: $queryString) {
      totalResults
      data {
        _id
        visitorId
        fromDate
        toDate
        numOfDays
        stayReason
        stayAllowedBy
        refVisitor {
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
  }
`;

export default PAGED_VISITOR_STAYS;
