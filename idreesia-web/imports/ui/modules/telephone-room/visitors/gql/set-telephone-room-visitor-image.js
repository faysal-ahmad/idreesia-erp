import gql from 'graphql-tag';

const SET_TELEPHONE_ROOM_VISITOR_IMAGE = gql`
  mutation setTelephoneRoomVisitorImage($_id: String!, $imageId: String!) {
    setTelephoneRoomVisitorImage(_id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default SET_TELEPHONE_ROOM_VISITOR_IMAGE;
