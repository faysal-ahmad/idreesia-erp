import gql from 'graphql-tag';

const PAGED_TELEPHONE_ROOM_VISITORS = gql`
  query pagedTelephoneRoomVisitors($queryString: String) {
    pagedTelephoneRoomVisitors(queryString: $queryString) {
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
        criminalRecord
        otherNotes
      }
    }
  }
`;

export default PAGED_TELEPHONE_ROOM_VISITORS;
