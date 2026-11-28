import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddHrKarkunsGroupMemberMutation,
  AddHrKarkunsGroupMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_HR_GROUP_MEMBER: TypedDocumentNode<AddHrKarkunsGroupMemberMutation, AddHrKarkunsGroupMemberMutationVariables> = gql`
  mutation addHrKarkunsGroupMember($groupId: String!, $karkunId: String!) {
    addHrKarkunsGroupMember(groupId: $groupId, karkunId: $karkunId)
  }
`;

export default ADD_HR_GROUP_MEMBER;
