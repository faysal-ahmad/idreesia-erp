import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveMehfilMutation,
  RemoveMehfilMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_MEHFIL: TypedDocumentNode<
  RemoveMehfilMutation,
  RemoveMehfilMutationVariables
> = gql`
  mutation removeMehfil($_id: String!) {
    removeMehfil(_id: $_id)
  }
`;

export default REMOVE_MEHFIL;
