import gql from 'graphql-tag';

const PAGED_VISITOR_STAYS = gql`
  query pagedVisitorStaysByVisitorId($visitorId: String!) {
    pagedVisitorStaysByVisitorId(visitorId: $visitorId) {
      totalResults
      data {
        _id
        visitorId
        fromDate
        toDate
        numOfDays
        stayReason
        dutyShiftName
        cancelledDate
        stayAllowedBy
      }
    }
  }
`;

export default PAGED_VISITOR_STAYS;
