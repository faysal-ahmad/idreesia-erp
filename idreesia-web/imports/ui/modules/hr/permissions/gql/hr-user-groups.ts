import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HrUserGroupsQuery,
  HrUserGroupsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const HR_USER_GROUPS: TypedDocumentNode<HrUserGroupsQuery, HrUserGroupsQueryVariables> = gql`
  query hrUserGroups {
    hrUserGroups {
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
