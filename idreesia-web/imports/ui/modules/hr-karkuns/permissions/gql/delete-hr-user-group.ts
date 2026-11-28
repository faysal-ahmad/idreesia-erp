import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteHrKarkunsUserGroupMutation,
  DeleteHrKarkunsUserGroupMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_HR_USER_GROUP: TypedDocumentNode<DeleteHrKarkunsUserGroupMutation, DeleteHrKarkunsUserGroupMutationVariables> = gql`
  mutation deleteHrKarkunsUserGroup($_id: String!) {
    deleteHrKarkunsUserGroup(_id: $_id)
  }
`;

export default DELETE_HR_USER_GROUP;
