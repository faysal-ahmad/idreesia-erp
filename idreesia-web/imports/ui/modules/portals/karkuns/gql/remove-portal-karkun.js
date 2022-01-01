import gql from 'graphql-tag';

const REMOVE_PORTAL_KARKUN = gql`
  mutation removePortalKarkun($portalId: String!, $_id: String!) {
    removePortalKarkun(portalId: $portalId, _id: $_id)
  }
`;

export default REMOVE_PORTAL_KARKUN;
