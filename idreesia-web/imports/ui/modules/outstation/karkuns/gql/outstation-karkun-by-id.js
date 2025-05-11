import gql from 'graphql-tag';

export const OUTSTATION_KARKUN_BY_ID = gql`
  query outstationKarkunById($_id: String!) {
    outstationKarkunById(_id: $_id) {
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
      user {
        _id
        username
        email
        emailVerified
        locked
        lastLoggedInAt
        lastActiveAt
        permissions
        instances
      }
    }
  }
`;
