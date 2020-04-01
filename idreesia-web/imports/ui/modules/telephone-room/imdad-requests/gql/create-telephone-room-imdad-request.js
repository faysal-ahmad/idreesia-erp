import gql from 'graphql-tag';

const CREATE_TELEPHONE_ROOM_IMDAD_REQUEST = gql`
  mutation createTelephoneRoomImdadRequest($visitorId: String!) {
    createTelephoneRoomImdadRequest(visitorId: $visitorId) {
      _id
      visitorId
      requestDate
      status
    }
  }
`;

export default CREATE_TELEPHONE_ROOM_IMDAD_REQUEST;
