import gql from 'graphql-tag';

const CREATE_PORTAL_ATTENDANCES = gql`
  mutation createPortalAttendances($portalId: String!, $month: String!) {
    createPortalAttendances(portalId: $portalId, month: $month)
  }
`;

export default CREATE_PORTAL_ATTENDANCES;
