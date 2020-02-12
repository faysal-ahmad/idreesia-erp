import gql from 'graphql-tag';

const DELETE_PORTAL_ATTENDANCES = gql`
  mutation deletePortalAttendances(
    $portalId: String!
    $month: String!
    $ids: [String]!
  ) {
    deletePortalAttendances(portalId: $portalId, month: $month, ids: $ids)
  }
`;

export default DELETE_PORTAL_ATTENDANCES;
