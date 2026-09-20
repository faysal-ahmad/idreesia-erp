import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteDuplicatePersonMutation,
  DeleteDuplicatePersonMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_DUPLICATE_PERSON: TypedDocumentNode<
  DeleteDuplicatePersonMutation,
  DeleteDuplicatePersonMutationVariables
> = gql`
  mutation deleteDuplicatePerson($_id: String!) {
    deleteDuplicatePerson(_id: $_id)
  }
`;

export default DELETE_DUPLICATE_PERSON;
