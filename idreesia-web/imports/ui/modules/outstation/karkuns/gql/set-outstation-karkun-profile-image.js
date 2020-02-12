import gql from 'graphql-tag';

const SET_OUTSTATION_KARKUN_PROFILE_IMAGE = gql`
  mutation setOutstationKarkunProfileImage($_id: String!, $imageId: String!) {
    setOutstationKarkunProfileImage(_id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default SET_OUTSTATION_KARKUN_PROFILE_IMAGE;
