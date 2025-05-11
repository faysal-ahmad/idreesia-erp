import gql from 'graphql-tag';

export const PAGED_OUTSTATION_PORTAL_USERS = gql`
  query pagedOutstationPortalUsers($filter: UserFilter) {
    pagedOutstationPortalUsers(filter: $filter) {
      totalResults
      data {
        _id
        username
        email
        emailVerified
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
