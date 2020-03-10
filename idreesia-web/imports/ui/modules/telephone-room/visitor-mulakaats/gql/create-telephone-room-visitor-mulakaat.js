import gql from 'graphql-tag';

const CREATE_TELEPHONE_ROOM_VISITOR_MULAKAAT = gql`
  mutation createTelephoneRoomVisitorMulakaat(
    $visitorId: String!
    $mulakaatDate: String!
  ) {
    createTelephoneRoomVisitorMulakaat(
      visitorId: $visitorId
      mulakaatDate: $mulakaatDate
    ) {
      _id
      visitorId
      mulakaatDate
      cancelledDate
    }
  }
`;

export default CREATE_TELEPHONE_ROOM_VISITOR_MULAKAAT;
