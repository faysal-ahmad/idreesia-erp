import gql from 'graphql-tag';

const PAGED_OUTSTATION_USERS = gql`
  query pagedOutstationUsers($filter: UserFilter) {
    pagedOutstationUsers(filter: $filter) {
      totalResults
      data {
        _id
        username
        email
        emailVerified
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

export default PAGED_OUTSTATION_USERS;
