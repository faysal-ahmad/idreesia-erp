import gql from 'graphql-tag';

const REMOVE_PORTAL_AMAANAT_LOG = gql`
  mutation removePortalAmaanatLog($portalId: String!, $_id: String!) {
    removePortalAmaanatLog(portalId: $portalId, _id: $_id)
  }
`;

export default REMOVE_PORTAL_AMAANAT_LOG;
