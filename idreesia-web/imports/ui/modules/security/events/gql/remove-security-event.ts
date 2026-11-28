import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveSecurityEventMutation,
  RemoveSecurityEventMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_SECURITY_EVENT: TypedDocumentNode<
  RemoveSecurityEventMutation,
  RemoveSecurityEventMutationVariables
> = gql`
  mutation removeSecurityEvent($_id: String!) {
    removeSecurityEvent(_id: $_id)
  }
`;

export default REMOVE_SECURITY_EVENT;
