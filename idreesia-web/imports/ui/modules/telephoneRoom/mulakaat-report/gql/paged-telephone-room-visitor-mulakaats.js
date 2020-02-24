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

export default PAGED_TELEPHONE_ROOM_VISITOR_MULAKAATS;
