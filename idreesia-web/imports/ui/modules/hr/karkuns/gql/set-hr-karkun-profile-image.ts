import gql from 'graphql-tag';

const SET_HR_KARKUN_PROFILE_IMAGE = gql`
  mutation setHrKarkunProfileImage($_id: String!, $imageId: String!) {
    setHrKarkunProfileImage(_id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default SET_HR_KARKUN_PROFILE_IMAGE;
