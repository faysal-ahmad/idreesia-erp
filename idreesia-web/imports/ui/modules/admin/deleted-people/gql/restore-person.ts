import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RestorePersonMutation,
  RestorePersonMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const RESTORE_PERSON: TypedDocumentNode<
  RestorePersonMutation,
  RestorePersonMutationVariables
> = gql`
  mutation restorePerson($_id: String!) {
    restorePerson(_id: $_id)
  }
`;

export default RESTORE_PERSON;
