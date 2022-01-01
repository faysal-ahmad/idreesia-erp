import gql from 'graphql-tag';

const ADD_PORTAL_KARKUN = gql`
  mutation addPortalKarkun($portalId: String!, $_id: String!) {
    addPortalKarkun(portalId: $portalId, _id: $_id) {
      _id
    }
  }
`;

export default ADD_PORTAL_KARKUN;
