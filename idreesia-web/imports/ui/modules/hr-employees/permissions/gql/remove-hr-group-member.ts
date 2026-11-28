import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveHrEmployeesGroupMemberMutation,
  RemoveHrEmployeesGroupMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_HR_GROUP_MEMBER: TypedDocumentNode<RemoveHrEmployeesGroupMemberMutation, RemoveHrEmployeesGroupMemberMutationVariables> = gql`
  mutation removeHrEmployeesGroupMember($groupId: String!, $userId: String!) {
    removeHrEmployeesGroupMember(groupId: $groupId, userId: $userId)
  }
`;

export default REMOVE_HR_GROUP_MEMBER;
