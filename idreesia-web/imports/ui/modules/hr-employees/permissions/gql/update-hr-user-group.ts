import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateHrEmployeesUserGroupMutation,
  UpdateHrEmployeesUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_HR_USER_GROUP: TypedDocumentNode<UpdateHrEmployeesUserGroupMutation, UpdateHrEmployeesUserGroupMutationVariables> = gql`
  mutation updateHrEmployeesUserGroup($_id: String!, $name: String!, $description: String) {
    updateHrEmployeesUserGroup(_id: $_id, name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default UPDATE_HR_USER_GROUP;
