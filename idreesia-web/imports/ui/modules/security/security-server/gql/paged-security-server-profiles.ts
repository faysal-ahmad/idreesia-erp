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
        externalUpdatedAt
        updatedAt
        deletedAt
        images {
          externalId
          imageUrl
        }
      }
    }
  }
`;

export default PAGED_SECURITY_SERVER_PROFILES;
