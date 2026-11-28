import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateHrKarkunsUserGroupMutation,
  UpdateHrKarkunsUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_HR_USER_GROUP: TypedDocumentNode<UpdateHrKarkunsUserGroupMutation, UpdateHrKarkunsUserGroupMutationVariables> = gql`
  mutation updateHrKarkunsUserGroup($_id: String!, $name: String!, $description: String) {
    updateHrKarkunsUserGroup(_id: $_id, name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default UPDATE_HR_USER_GROUP;
