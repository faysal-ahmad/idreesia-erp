import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateHrEmployeesUserGroupMutation,
  CreateHrEmployeesUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_HR_USER_GROUP: TypedDocumentNode<CreateHrEmployeesUserGroupMutation, CreateHrEmployeesUserGroupMutationVariables> = gql`
  mutation createHrEmployeesUserGroup($name: String!, $description: String) {
    createHrEmployeesUserGroup(name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default CREATE_HR_USER_GROUP;
