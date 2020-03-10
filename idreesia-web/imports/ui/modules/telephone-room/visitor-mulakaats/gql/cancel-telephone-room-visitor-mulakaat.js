import gql from 'graphql-tag';

const CANCEL_TELEPHONE_ROOM_VISITOR_MULAKAAT = gql`
  mutation cancelTelephoneRoomVisitorMulakaat($_id: String!) {
    cancelTelephoneRoomVisitorMulakaat(_id: $_id) {
      _id
      visitorId
      mulakaatDate
      cancelledDate
    }
  }
`;

export default CANCEL_TELEPHONE_ROOM_VISITOR_MULAKAAT;
