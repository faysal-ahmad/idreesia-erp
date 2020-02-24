import gql from 'graphql-tag';

const DELETE_TELEPHONE_ROOM_VISITOR = gql`
  mutation deleteTelephoneRoomVisitor($_id: String!) {
    deleteTelephoneRoomVisitor(_id: $_id)
  }
`;

export default DELETE_TELEPHONE_ROOM_VISITOR;
