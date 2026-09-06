import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedSecurityUsersQuery,
  PagedSecurityUsersQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_SECURITY_USERS: TypedDocumentNode<
  PagedSecurityUsersQuery,
  PagedSecurityUsersQueryVariables
> = gql`
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
            imageThumbnailId
          }
        }
      }
    }
  }
`;

export default PAGED_SECURITY_USERS;
