import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  FixNameSpellingMutation,
  FixNameSpellingMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const FIX_NAME_SPELLING: TypedDocumentNode<
  FixNameSpellingMutation,
  FixNameSpellingMutationVariables
> = gql`
  mutation fixNameSpelling($existingSpelling: String!, $newSpelling: String!) {
    fixNameSpelling(
      existingSpelling: $existingSpelling
      newSpelling: $newSpelling
    )
  }
`;

export default FIX_NAME_SPELLING;
