import gql from 'graphql-tag';

const PAGED_USERS = gql`
  query pagedUsers($filter: UserFilter) {
    pagedUsers(filter: $filter) {
      totalResults
      data {
        _id
        username
        email
        displayName
        locked
        lastActiveAt
        karkun {
          _id
          name
          imageId
        }
      }
    }
  }
`;

export default PAGED_USERS;
