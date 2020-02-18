import gql from 'graphql-tag';

const SET_KARKUN_PROFILE_IMAGE = gql`
  mutation setKarkunProfileImage($_id: String!, $imageId: String!) {
    setKarkunProfileImage(_id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default SET_KARKUN_PROFILE_IMAGE;
