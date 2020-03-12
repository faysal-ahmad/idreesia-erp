import gql from 'graphql-tag';

const CREATE_PORTAL_USER = gql`
  mutation createPortalUser(
    $portalId: String!
    $userName: String!
    $password: String!
    $karkunId: String!
  ) {
    createPortalUser(
      portalId: $portalId
      userName: $userName
      password: $password
      karkunId: $karkunId
    ) {
      _id
    }
  }
`;

export default CREATE_PORTAL_USER;
