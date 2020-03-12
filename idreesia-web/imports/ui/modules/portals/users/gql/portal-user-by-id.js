import gql from 'graphql-tag';

const PORTAL_USER_BY_ID = gql`
  query portalUserById($portalId: String!, $_id: String!) {
    portalUserById(portalId: $portalId, _id: $_id) {
      _id
      username
      locked
      instances
      permissions
      karkunId
      karkun {
        _id
        name
      }
    }
  }
`;

export default PORTAL_USER_BY_ID;
