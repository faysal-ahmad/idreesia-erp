import gql from 'graphql-tag';

const ALL_IMDAD_REASONS = gql`
  query allImdadReasons {
    allImdadReasons {
      _id
      name
      description
      usedCount
    }
  }
`;

export default ALL_IMDAD_REASONS;
