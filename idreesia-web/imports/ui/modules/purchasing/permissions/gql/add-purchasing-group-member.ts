import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AddPurchasingGroupMemberMutation,
  AddPurchasingGroupMemberMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ADD_PURCHASING_GROUP_MEMBER: TypedDocumentNode<AddPurchasingGroupMemberMutation, AddPurchasingGroupMemberMutationVariables> = gql`
  mutation addPurchasingGroupMember($groupId: String!, $karkunId: String!) {
    addPurchasingGroupMember(groupId: $groupId, karkunId: $karkunId)
  }
`;

export default ADD_PURCHASING_GROUP_MEMBER;
