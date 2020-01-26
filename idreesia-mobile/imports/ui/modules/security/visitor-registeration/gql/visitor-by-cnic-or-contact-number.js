import gql from 'graphql-tag';

const VISITOR_BY_CNIC_OR_CONTACT_NUMBER = gql`
  query visitorByCnicOrContactNumber(
    $cnicNumber: String
    $contactNumber: String
  ) {
    visitorByCnicOrContactNumber(
      cnicNumber: $cnicNumber
      contactNumber: $contactNumber
    ) {
      _id
      name
      cnicNumber
      parentName
      ehadDate
      referenceName
      contactNumber1
      contactNumber2
      city
      country
      imageId
    }
  }
`;

export default VISITOR_BY_CNIC_OR_CONTACT_NUMBER;
