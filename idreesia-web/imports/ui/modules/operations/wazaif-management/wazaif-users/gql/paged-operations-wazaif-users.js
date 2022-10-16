import gql from 'graphql-tag';

const PAGED_OPERATIONS_WAZAIF_USERS = gql`
  query pagedOperationsWazaifUsers($filter: UserFilter) {
    pagedOperationsWazaifUsers(filter: $filter) {
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

export default PAGED_OPERATIONS_WAZAIF_USERS;
