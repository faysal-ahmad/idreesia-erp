import gql from 'graphql-tag';

const SET_OUTSTATION_MEMBER_IMAGE = gql`
  mutation setOutstationMemberImage($_id: String!, $imageId: String!) {
    setOutstationMemberImage(_id: $_id, imageId: $imageId) {
      _id
      imageId
    }
  }
`;

export default SET_OUTSTATION_MEMBER_IMAGE;
