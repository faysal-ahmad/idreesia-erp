import gql from 'graphql-tag';

const OUTSTATION_MEMBER_BY_ID = gql`
  query outstationMemberById($_id: String!) {
    outstationMemberById(_id: $_id) {
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

export default OUTSTATION_MEMBER_BY_ID;
