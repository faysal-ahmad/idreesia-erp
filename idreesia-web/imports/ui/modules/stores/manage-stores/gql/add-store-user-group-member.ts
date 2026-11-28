import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddStoreUserGroupMemberMutation,
  AddStoreUserGroupMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_STORE_USER_GROUP_MEMBER: TypedDocumentNode<AddStoreUserGroupMemberMutation, AddStoreUserGroupMemberMutationVariables> = gql`
  mutation addStoreUserGroupMember($groupId: String!, $karkunId: String!) {
    addStoreUserGroupMember(groupId: $groupId, karkunId: $karkunId)
  }
`;

export default ADD_STORE_USER_GROUP_MEMBER;
