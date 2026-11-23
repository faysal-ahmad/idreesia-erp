import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveSecurityGroupMemberMutation,
  RemoveSecurityGroupMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_SECURITY_GROUP_MEMBER: TypedDocumentNode<RemoveSecurityGroupMemberMutation, RemoveSecurityGroupMemberMutationVariables> = gql`
  mutation removeSecurityGroupMember($groupId: String!, $userId: String!) {
    removeSecurityGroupMember(groupId: $groupId, userId: $userId)
  }
`;

export default REMOVE_SECURITY_GROUP_MEMBER;
