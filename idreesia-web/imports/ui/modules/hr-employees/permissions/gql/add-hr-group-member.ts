import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddHrEmployeesGroupMemberMutation,
  AddHrEmployeesGroupMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_HR_GROUP_MEMBER: TypedDocumentNode<AddHrEmployeesGroupMemberMutation, AddHrEmployeesGroupMemberMutationVariables> = gql`
  mutation addHrEmployeesGroupMember($groupId: String!, $karkunId: String!) {
    addHrEmployeesGroupMember(groupId: $groupId, karkunId: $karkunId)
  }
`;

export default ADD_HR_GROUP_MEMBER;
