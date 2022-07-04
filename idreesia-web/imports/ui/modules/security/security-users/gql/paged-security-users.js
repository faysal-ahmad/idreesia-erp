import gql from 'graphql-tag';

const PAGED_SECURITY_USERS = gql`
  query pagedSecurityUsers($filter: UserFilter) {
    pagedSecurityUsers(filter: $filter) {
      totalResults
      data {
        _id
        username
        locked
        lastActiveAt
        permissions
        person {
          _id
          sharedData {
            name
            imageId
          }
        }
      }
    }
  }
`;

export default PAGED_SECURITY_USERS;
