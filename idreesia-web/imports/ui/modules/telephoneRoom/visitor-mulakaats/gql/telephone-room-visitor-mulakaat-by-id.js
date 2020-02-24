import gql from 'graphql-tag';

const TELEPHONE_ROOM_VISITOR_MULAKAAT_BY_ID = gql`
  query telephoneRoomVisitorMulakaatById($_id: String!) {
    telephoneRoomVisitorMulakaatById(_id: $_id) {
      _id
      mulakaatDate
      visitor {
        _id
        name
        parentName
        cnicNumber
        city
        country
      }
    }
  }
`;

export default TELEPHONE_ROOM_VISITOR_MULAKAAT_BY_ID;
