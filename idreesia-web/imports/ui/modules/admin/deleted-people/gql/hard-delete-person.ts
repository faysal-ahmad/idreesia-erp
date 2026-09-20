import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HardDeletePersonMutation,
  HardDeletePersonMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const HARD_DELETE_PERSON: TypedDocumentNode<
  HardDeletePersonMutation,
  HardDeletePersonMutationVariables
> = gql`
  mutation hardDeletePerson($_id: String!) {
    hardDeletePerson(_id: $_id)
  }
`;

export default HARD_DELETE_PERSON;
