import gql from 'graphql-tag';

const SECURITY_VISITOR_BY_CNIC_OR_CONTACT_NUMBER = gql`
  query securityVisitorByCnicOrContactNumber(
    $cnicNumber: String
    $contactNumber: String
  ) {
    securityVisitorByCnicOrContactNumber(
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

export default SECURITY_VISITOR_BY_CNIC_OR_CONTACT_NUMBER;
