import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HardDeletePeopleMutation,
  HardDeletePeopleMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const HARD_DELETE_PEOPLE: TypedDocumentNode<
  HardDeletePeopleMutation,
  HardDeletePeopleMutationVariables
> = gql`
  mutation hardDeletePeople($_ids: [String!]!) {
    hardDeletePeople(_ids: $_ids)
  }
`;

export default HARD_DELETE_PEOPLE;
