import gql from 'graphql-tag';

const REMOVE_PORTAL_KARKUN_DUTY = gql`
  mutation removePortalKarkunDuty($portalId: String!, $_id: String!) {
    removePortalKarkunDuty(portalId: $portalId, _id: $_id)
  }
`;

export default REMOVE_PORTAL_KARKUN_DUTY;
