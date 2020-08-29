import gql from 'graphql-tag';

const OPERATIONS_VISITOR_BY_ID = gql`
  query operationsVisitorById($_id: String!) {
    operationsVisitorById(_id: $_id) {
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
      imageId
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default OPERATIONS_VISITOR_BY_ID;
