import gql from 'graphql-tag';

const PORTAL_KARKUN_BY_ID = gql`
  query portalKarkunById($portalId: String!, $_id: String!) {
    portalKarkunById(portalId: $portalId, _id: $_id) {
      _id
      name
      parentName
      cnicNumber
      contactNumber1
      contactNumber2
      emailAddress
      currentAddress
      permanentAddress
      cityId
      cityMehfilId
      bloodGroup
      educationalQualification
      meansOfEarning
      ehadDate
      ehadKarkun
      ehadPermissionDate
      birthDate
      lastTarteebDate
      mehfilRaabta
      msRaabta
      msLastVisitDate
      referenceName
      imageId
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default PORTAL_KARKUN_BY_ID;
