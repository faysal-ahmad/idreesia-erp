import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RenameFreeFormCityMutation,
  RenameFreeFormCityMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const RENAME_FREE_FORM_CITY: TypedDocumentNode<
  RenameFreeFormCityMutation,
  RenameFreeFormCityMutationVariables
> = gql`
  mutation renameFreeFormCity($existingSpelling: String!, $newSpelling: String!) {
    renameFreeFormCity(
      existingSpelling: $existingSpelling
      newSpelling: $newSpelling
    )
  }
`;

export default RENAME_FREE_FORM_CITY;
