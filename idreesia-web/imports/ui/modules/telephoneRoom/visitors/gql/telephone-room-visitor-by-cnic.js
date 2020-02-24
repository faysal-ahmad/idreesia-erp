import gql from 'graphql-tag';

const TELEPHONE_ROOM_VISITOR_BY_CNIC = gql`
  query telephoneRoomVisitorByCnic($cnicNumbers: [String]!) {
    telephoneRoomVisitorByCnic(cnicNumbers: $cnicNumbers) {
      _id
      name
      cnicNumber
      parentName
      ehadDate
      referenceName
      contactNumber1
      city
      country
      imageId
      criminalRecord
      otherNotes
    }
  }
`;

export default TELEPHONE_ROOM_VISITOR_BY_CNIC;
