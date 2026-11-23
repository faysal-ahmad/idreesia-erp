import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemovePurchasingGroupMemberMutation,
  RemovePurchasingGroupMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_PURCHASING_GROUP_MEMBER: TypedDocumentNode<RemovePurchasingGroupMemberMutation, RemovePurchasingGroupMemberMutationVariables> = gql`
  mutation removePurchasingGroupMember($groupId: String!, $userId: String!) {
    removePurchasingGroupMember(groupId: $groupId, userId: $userId)
  }
`;

export default REMOVE_PURCHASING_GROUP_MEMBER;
