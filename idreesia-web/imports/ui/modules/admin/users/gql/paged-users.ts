import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedUsersQuery,
  PagedUsersQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_USERS: TypedDocumentNode<
  PagedUsersQuery,
  PagedUsersQueryVariables
> = gql`
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

export default PAGED_USERS;
