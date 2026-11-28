import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteHrEmployeesUserGroupMutation,
  DeleteHrEmployeesUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_HR_USER_GROUP: TypedDocumentNode<DeleteHrEmployeesUserGroupMutation, DeleteHrEmployeesUserGroupMutationVariables> = gql`
  mutation deleteHrEmployeesUserGroup($_id: String!) {
    deleteHrEmployeesUserGroup(_id: $_id)
  }
`;

export default DELETE_HR_USER_GROUP;
