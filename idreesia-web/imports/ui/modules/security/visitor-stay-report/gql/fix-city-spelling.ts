import gql from 'graphql-tag';

const FIX_CITY_SPELLING = gql`
  mutation fixCitySpelling($existingSpelling: String!, $newSpelling: String!) {
    fixCitySpelling(
      existingSpelling: $existingSpelling
      newSpelling: $newSpelling
    )
  }
`;

export default FIX_CITY_SPELLING;
