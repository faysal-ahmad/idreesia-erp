import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveSecurityEventKarkunMutation,
  RemoveSecurityEventKarkunMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const REMOVE_SECURITY_EVENT_KARKUN: TypedDocumentNode<
  RemoveSecurityEventKarkunMutation,
  RemoveSecurityEventKarkunMutationVariables
> = gql`
  mutation removeSecurityEventKarkun($_id: String!) {
    removeSecurityEventKarkun(_id: $_id)
  }
`;
