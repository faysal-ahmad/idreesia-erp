import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveStoreUserGroupMemberMutation,
  RemoveStoreUserGroupMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_STORE_USER_GROUP_MEMBER: TypedDocumentNode<RemoveStoreUserGroupMemberMutation, RemoveStoreUserGroupMemberMutationVariables> = gql`
  mutation removeStoreUserGroupMember($groupId: String!, $userId: String!) {
    removeStoreUserGroupMember(groupId: $groupId, userId: $userId)
  }
`;

export default REMOVE_STORE_USER_GROUP_MEMBER;
