import gql from 'graphql-tag';

const SECURITY_VISITOR_BY_ID = gql`
  query securityVisitorById($_id: String!) {
    securityVisitorById(_id: $_id) {
      _id
      name
      parentName
      cnicNumber
      ehadDate
      birthDate
      referenceName
      contactNumber1
      contactNumber2
      city
      country
      currentAddress
      permanentAddress
      educationalQualification
      meansOfEarning
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

export default SECURITY_VISITOR_BY_ID;
