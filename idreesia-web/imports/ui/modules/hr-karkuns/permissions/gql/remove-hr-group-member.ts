import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveHrKarkunsGroupMemberMutation,
  RemoveHrKarkunsGroupMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_HR_GROUP_MEMBER: TypedDocumentNode<RemoveHrKarkunsGroupMemberMutation, RemoveHrKarkunsGroupMemberMutationVariables> = gql`
  mutation removeHrKarkunsGroupMember($groupId: String!, $userId: String!) {
    removeHrKarkunsGroupMember(groupId: $groupId, userId: $userId)
  }
`;

export default REMOVE_HR_GROUP_MEMBER;
