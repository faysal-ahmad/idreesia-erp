import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateHrUserGroupMutation,
  CreateHrUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_HR_USER_GROUP: TypedDocumentNode<CreateHrUserGroupMutation, CreateHrUserGroupMutationVariables> = gql`
  mutation createHrUserGroup($name: String!, $description: String) {
    createHrUserGroup(name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default CREATE_HR_USER_GROUP;
