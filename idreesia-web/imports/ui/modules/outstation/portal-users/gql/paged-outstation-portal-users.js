import gql from 'graphql-tag';

const PAGED_OUTSTATION_PORTAL_USERS = gql`
  query pagedOutstationPortalUsers($filter: UserFilter) {
    pagedOutstationPortalUsers(filter: $filter) {
      totalResults
      data {
        _id
        username
        locked
        lastActiveAt
        permissions
        portal {
          _id
          name
        }
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

export default PAGED_OUTSTATION_PORTAL_USERS;
