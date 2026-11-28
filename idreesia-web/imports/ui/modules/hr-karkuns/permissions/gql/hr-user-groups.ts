import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HrKarkunsUserGroupsQuery,
  HrKarkunsUserGroupsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const HR_USER_GROUPS: TypedDocumentNode<HrKarkunsUserGroupsQuery, HrKarkunsUserGroupsQueryVariables> = gql`
  query hrKarkunsUserGroups {
    hrKarkunsUserGroups {
      _id
      name
      description
      users {
        userId
        personId
        username
        displayName
      }
    }
  }
`;

export default HR_USER_GROUPS;
