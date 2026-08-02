import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  FixCitySpellingMutation,
  FixCitySpellingMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const FIX_CITY_SPELLING: TypedDocumentNode<
  FixCitySpellingMutation,
  FixCitySpellingMutationVariables
> = gql`
  mutation fixCitySpelling($existingSpelling: String!, $newSpelling: String!) {
    fixCitySpelling(
      existingSpelling: $existingSpelling
      newSpelling: $newSpelling
    )
  }
`;

export default FIX_CITY_SPELLING;
