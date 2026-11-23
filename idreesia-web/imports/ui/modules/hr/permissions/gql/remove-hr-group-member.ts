import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveHrGroupMemberMutation,
  RemoveHrGroupMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_HR_GROUP_MEMBER: TypedDocumentNode<RemoveHrGroupMemberMutation, RemoveHrGroupMemberMutationVariables> = gql`
  mutation removeHrGroupMember($groupId: String!, $userId: String!) {
    removeHrGroupMember(groupId: $groupId, userId: $userId)
  }
`;

export default REMOVE_HR_GROUP_MEMBER;
