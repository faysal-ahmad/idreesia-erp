import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateHrUserGroupMutation,
  UpdateHrUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_HR_USER_GROUP: TypedDocumentNode<UpdateHrUserGroupMutation, UpdateHrUserGroupMutationVariables> = gql`
  mutation updateHrUserGroup($_id: String!, $name: String!, $description: String) {
    updateHrUserGroup(_id: $_id, name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default UPDATE_HR_USER_GROUP;
