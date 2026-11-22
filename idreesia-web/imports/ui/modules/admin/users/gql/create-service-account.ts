import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateServiceAccountMutation,
  CreateServiceAccountMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_SERVICE_ACCOUNT: TypedDocumentNode<
  CreateServiceAccountMutation,
  CreateServiceAccountMutationVariables
> = gql`
  mutation createServiceAccount($userName: String!, $displayName: String) {
    createServiceAccount(userName: $userName, displayName: $displayName) {
      _id
    }
  }
`;

export default CREATE_SERVICE_ACCOUNT;
