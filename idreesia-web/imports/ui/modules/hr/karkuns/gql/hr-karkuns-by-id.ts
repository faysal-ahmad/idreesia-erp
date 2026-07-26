import gql from 'graphql-tag';

const HR_KARKUNS_BY_ID = gql`
  query hrKarkunsById($_ids: String!) {
    hrKarkunsById(_ids: $_ids) {
      _id
      name
      parentName
      cnicNumber
      imageId
      contactNumber1
      contactNumber2
      image {
        _id
        data
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

export default HR_KARKUNS_BY_ID;
