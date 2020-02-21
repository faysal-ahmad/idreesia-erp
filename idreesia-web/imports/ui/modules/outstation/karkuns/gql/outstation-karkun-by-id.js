import gql from 'graphql-tag';

const OUTSTATION_KARKUN_BY_ID = gql`
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
      lastTarteebDate
      referenceName
      imageId
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default OUTSTATION_KARKUN_BY_ID;
