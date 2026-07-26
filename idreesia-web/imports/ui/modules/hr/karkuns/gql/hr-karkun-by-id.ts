import gql from 'graphql-tag';

const HR_KARKUN_BY_ID = gql`
  query hrKarkunById($_id: String!) {
    hrKarkunById(_id: $_id) {
      _id
      name
      parentName
      cnicNumber
      imageId
      contactNumber1
      contactNumber2
      contactNumber1Subscribed
      contactNumber2Subscribed
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
      deathDate
      lastTarteebDate
      mehfilRaabta
      msRaabta
      referenceName
      isEmployee
      jobId
      employmentStartDate
      employmentEndDate
      bankAccountDetails
      createdAt
      createdBy
      updatedAt
      updatedBy
      attachments {
        _id
        name
        description
        mimeType
      }
      job {
        _id
        name
      }
      duties {
        _id
        dutyName
        shiftName
        locationName
      }
    }
  }
`;

export default HR_KARKUN_BY_ID;
