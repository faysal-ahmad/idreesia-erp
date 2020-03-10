import gql from 'graphql-tag';

const PAGED_TELEPHONE_ROOM_VISITOR_MULAKAATS = gql`
  query pagedTelephoneRoomVisitorMulakaats($filter: VisitorMulakaatFilter) {
    pagedTelephoneRoomVisitorMulakaats(filter: $filter) {
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

export default PAGED_TELEPHONE_ROOM_VISITOR_MULAKAATS;
