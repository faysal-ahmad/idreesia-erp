import gql from 'graphql-tag';

const CANCEL_TELEPHONE_ROOM_VISITOR_MULAKAATS = gql`
  mutation cancelTelephoneRoomVisitorMulakaats($mulakaatDate: String!) {
    cancelTelephoneRoomVisitorMulakaats(mulakaatDate: $mulakaatDate)
  }
`;

export default CANCEL_TELEPHONE_ROOM_VISITOR_MULAKAATS;
