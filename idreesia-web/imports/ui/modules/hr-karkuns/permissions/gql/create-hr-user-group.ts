import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateHrKarkunsUserGroupMutation,
  CreateHrKarkunsUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_HR_USER_GROUP: TypedDocumentNode<CreateHrKarkunsUserGroupMutation, CreateHrKarkunsUserGroupMutationVariables> = gql`
  mutation createHrKarkunsUserGroup($name: String!, $description: String) {
    createHrKarkunsUserGroup(name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default CREATE_HR_USER_GROUP;
