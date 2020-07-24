import gql from 'graphql-tag';

const OPERATIONS_VISITORS_BY_CNIC = gql`
  query operationsVisitorsByCnic(
    $cnicNumbers: [String]
    $partialCnicNumber: String
  ) {
    operationsVisitorsByCnic(
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

export default OPERATIONS_VISITORS_BY_CNIC;
