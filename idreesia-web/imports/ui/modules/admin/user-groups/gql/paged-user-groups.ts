import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedUserGroupsQuery,
  PagedUserGroupsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_USER_GROUPS: TypedDocumentNode<
  PagedUserGroupsQuery,
  PagedUserGroupsQueryVariables
> = gql`
  query pagedUserGroups($queryString: String) {
    pagedUserGroups(queryString: $queryString) {
      totalResults
      data {
        _id
        name
        moduleName
        description
        users {
          userId
          personId
          username
          displayName
          karkun {
            _id
            sharedData {
              name
              imageUrl
              imageThumbnailUrl
              cnicNumber
              contactNumber1
              contactNumber2
            }
          }
        }
      }
    }
  }
`;

export default PAGED_USER_GROUPS;
