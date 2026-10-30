import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedSecurityServerProfilesQuery,
  PagedSecurityServerProfilesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_SECURITY_SERVER_PROFILES: TypedDocumentNode<
  PagedSecurityServerProfilesQuery,
  PagedSecurityServerProfilesQueryVariables
> = gql`
  query pagedSecurityServerProfiles($filter: SecurityServerProfileFilter) {
    pagedSecurityServerProfiles(filter: $filter) {
      totalResults
      data {
        _id
        name
        isTest
        alertsCount
        updatedAt
        deletedAt
        images {
          _id
          imageUrl
          thumbnailUrl
        }
        defaultImageId
      }
    }
  }
`;

export default PAGED_SECURITY_SERVER_PROFILES;
