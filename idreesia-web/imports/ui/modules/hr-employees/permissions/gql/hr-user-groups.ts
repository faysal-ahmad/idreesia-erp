import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HrEmployeesUserGroupsQuery,
  HrEmployeesUserGroupsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const HR_USER_GROUPS: TypedDocumentNode<HrEmployeesUserGroupsQuery, HrEmployeesUserGroupsQueryVariables> = gql`
  query hrEmployeesUserGroups {
    hrEmployeesUserGroups {
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
