import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddHrGroupMemberMutation,
  AddHrGroupMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_HR_GROUP_MEMBER: TypedDocumentNode<AddHrGroupMemberMutation, AddHrGroupMemberMutationVariables> = gql`
  mutation addHrGroupMember($groupId: String!, $karkunId: String!) {
    addHrGroupMember(groupId: $groupId, karkunId: $karkunId)
  }
`;

export default ADD_HR_GROUP_MEMBER;
