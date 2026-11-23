import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteHrUserGroupMutation,
  DeleteHrUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_HR_USER_GROUP: TypedDocumentNode<DeleteHrUserGroupMutation, DeleteHrUserGroupMutationVariables> = gql`
  mutation deleteHrUserGroup($_id: String!) {
    deleteHrUserGroup(_id: $_id)
  }
`;

export default DELETE_HR_USER_GROUP;
