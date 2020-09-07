import gql from 'graphql-tag';

const PAGED_PORTAL_USERS = gql`
  query pagedPortalUsers($portalId: String!, $filter: UserFilter) {
    pagedPortalUsers(portalId: $portalId, filter: $filter) {
      totalResults
      data {
        _id
        username
        locked
        lastActiveAt
        permissions
        karkun {
          _id
          name
          imageId
          city {
            _id
            name
            country
          }
          cityMehfil {
            _id
            name
          }
        }
      }
    }
  }
`;

export default PAGED_PORTAL_USERS;
