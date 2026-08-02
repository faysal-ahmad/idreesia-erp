import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveMehfilKarkunMutation,
  RemoveMehfilKarkunMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const REMOVE_MEHFIL_KARKUN: TypedDocumentNode<
  RemoveMehfilKarkunMutation,
  RemoveMehfilKarkunMutationVariables
> = gql`
  mutation removeMehfilKarkun($_id: String!) {
    removeMehfilKarkun(_id: $_id)
  }
`;
