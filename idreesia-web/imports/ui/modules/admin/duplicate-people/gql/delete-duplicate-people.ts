import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteDuplicatePeopleMutation,
  DeleteDuplicatePeopleMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_DUPLICATE_PEOPLE: TypedDocumentNode<
  DeleteDuplicatePeopleMutation,
  DeleteDuplicatePeopleMutationVariables
> = gql`
  mutation deleteDuplicatePeople($_ids: [String]!) {
    deleteDuplicatePeople(_ids: $_ids)
  }
`;

export default DELETE_DUPLICATE_PEOPLE;
