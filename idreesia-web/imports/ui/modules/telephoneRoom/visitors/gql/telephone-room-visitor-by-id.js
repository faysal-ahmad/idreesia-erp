import gql from 'graphql-tag';

const TELEPHONE_ROOM_VISITOR_BY_ID = gql`
  query telephoneRoomVisitorById($_id: String!) {
    telephoneRoomVisitorById(_id: $_id) {
      _id
      name
      parentName
      cnicNumber
      ehadDate
      referenceName
      contactNumber1
      contactNumber2
      address
      city
      country
      criminalRecord
      otherNotes
      imageId
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default TELEPHONE_ROOM_VISITOR_BY_ID;
