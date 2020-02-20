import gql from 'graphql-tag';

const FIX_NAME_SPELLING = gql`
  mutation fixNameSpelling($existingSpelling: String!, $newSpelling: String!) {
    fixNameSpelling(
      existingSpelling: $existingSpelling
      newSpelling: $newSpelling
    )
  }
`;

export default FIX_NAME_SPELLING;
