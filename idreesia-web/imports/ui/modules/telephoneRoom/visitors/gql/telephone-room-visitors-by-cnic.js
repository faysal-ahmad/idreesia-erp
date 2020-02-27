import gql from 'graphql-tag';

const TELEPHONE_ROOM_VISITORS_BY_CNIC = gql`
  query telephoneRoomVisitorsByCnic(
    $cnicNumbers: [String]
    $partialCnicNumber: String
  ) {
    telephoneRoomVisitorsByCnic(
      cnicNumbers: $cnicNumbers
      partialCnicNumber: $partialCnicNumber
    ) {
      _id
      name
      cnicNumber
      parentName
      ehadDate
      birthDate
      referenceName
      contactNumber1
      city
      country
      imageId
    }
  }
`;

export default TELEPHONE_ROOM_VISITORS_BY_CNIC;
