import gql from 'graphql-tag';

const PORTAL_MEMBER_BY_ID = gql`
  query portalMemberById($portalId: String!, $_id: String!) {
    portalMemberById(portalId: $portalId, _id: $_id) {
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

export default PORTAL_MEMBER_BY_ID;
