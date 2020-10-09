import gql from 'graphql-tag';

const PAGED_OUTSTATION_USERS = gql`
  query pagedOutstationUsers($filter: UserFilter) {
    pagedOutstationUsers(filter: $filter) {
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
        }
      }
    }
  }
`;

export default PAGED_OUTSTATION_USERS;
