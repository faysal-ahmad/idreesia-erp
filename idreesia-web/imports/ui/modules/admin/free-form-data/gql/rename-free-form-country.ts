import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RenameFreeFormCountryMutation,
  RenameFreeFormCountryMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const RENAME_FREE_FORM_COUNTRY: TypedDocumentNode<
  RenameFreeFormCountryMutation,
  RenameFreeFormCountryMutationVariables
> = gql`
  mutation renameFreeFormCountry(
    $existingSpelling: String!
    $newSpelling: String!
  ) {
    renameFreeFormCountry(
      existingSpelling: $existingSpelling
      newSpelling: $newSpelling
    )
  }
`;

export default RENAME_FREE_FORM_COUNTRY;
