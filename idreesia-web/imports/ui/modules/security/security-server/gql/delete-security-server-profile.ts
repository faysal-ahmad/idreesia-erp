import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteSecurityServerProfileMutation,
  DeleteSecurityServerProfileMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_SECURITY_SERVER_PROFILE: TypedDocumentNode<
  DeleteSecurityServerProfileMutation,
  DeleteSecurityServerProfileMutationVariables
> = gql`
  mutation deleteSecurityServerProfile($_id: String!) {
    deleteSecurityServerProfile(_id: $_id)
  }
`;

export default DELETE_SECURITY_SERVER_PROFILE;
