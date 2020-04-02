import gql from 'graphql-tag';

const PAGED_TELEPHONE_ROOM_IMDAD_REQUESTS = gql`
  query pagedTelephoneRoomImdadRequests($filter: ImdadRequestFilter) {
    pagedTelephoneRoomImdadRequests(filter: $filter) {
      totalResults
      data {
        _id
        visitorId
        requestDate
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

export default PAGED_TELEPHONE_ROOM_IMDAD_REQUESTS;
