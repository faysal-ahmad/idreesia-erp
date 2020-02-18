import gql from 'graphql-tag';

const KARKUN_BY_ID = gql`
  query karkunById($_id: String!) {
    karkunById(_id: $_id) {
      _id
      name
      parentName
      cnicNumber
      imageId
      contactNumber1
      contactNumber2
      emailAddress
      currentAddress
      permanentAddress
      bloodGroup
      sharedResidenceId
      educationalQualification
      meansOfEarning
      ehadDate
      referenceName
      isEmployee
      jobId
      employmentStartDate
      employmentEndDate
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

export default KARKUN_BY_ID;
