import gql from 'graphql-tag';

const DELETE_TELEPHONE_ROOM_IMDAD_REQUEST = gql`
  mutation deleteTelephoneRoomImdadRequest($_id: String!) {
    deleteTelephoneRoomImdadRequest(_id: $_id)
  }
`;

export default DELETE_TELEPHONE_ROOM_IMDAD_REQUEST;
