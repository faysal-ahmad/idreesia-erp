import gql from 'graphql-tag';

const SECURITY_VISITOR_BY_CNIC = gql`
  query securityVisitorByCnic($cnicNumbers: [String]!) {
    securityVisitorByCnic(cnicNumbers: $cnicNumbers) {
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

export default SECURITY_VISITOR_BY_CNIC;
