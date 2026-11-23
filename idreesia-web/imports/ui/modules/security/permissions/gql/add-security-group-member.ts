import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddSecurityGroupMemberMutation,
  AddSecurityGroupMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_SECURITY_GROUP_MEMBER: TypedDocumentNode<AddSecurityGroupMemberMutation, AddSecurityGroupMemberMutationVariables> = gql`
  mutation addSecurityGroupMember($groupId: String!, $karkunId: String!) {
    addSecurityGroupMember(groupId: $groupId, karkunId: $karkunId)
  }
`;

export default ADD_SECURITY_GROUP_MEMBER;
