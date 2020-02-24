import gql from 'graphql-tag';

const DELETE_TELEPHONE_ROOM_VISITOR_MULAKAAT = gql`
  mutation deleteTelephoneRoomVisitorMulakaat($_id: String!) {
    deleteTelephoneRoomVisitorMulakaat(_id: $_id)
  }
`;

export default DELETE_TELEPHONE_ROOM_VISITOR_MULAKAAT;
