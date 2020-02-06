import gql from 'graphql-tag';

const CREATE_PORTAL_KARKUN_DUTY = gql`
  mutation createPortalKarkunDuty(
    $portalId: String!
    $karkunId: String!
    $dutyId: String!
  ) {
    createPortalKarkunDuty(
      portalId: $portalId
      karkunId: $karkunId
      dutyId: $dutyId
    ) {
      _id
      dutyId
      dutyName
    }
  }
`;

export default CREATE_PORTAL_KARKUN_DUTY;
