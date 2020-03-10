import gql from 'graphql-tag';

const PAGED_TELEPHONE_ROOM_VISITORS = gql`
  query pagedTelephoneRoomVisitors($filter: VisitorFilter) {
    pagedTelephoneRoomVisitors(filter: $filter) {
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
      }
    }
  }
`;

export default PAGED_TELEPHONE_ROOM_VISITORS;
