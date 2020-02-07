import gql from 'graphql-tag';

const ALL_MEHFILS = gql`
  query allMehfils {
    allMehfils {
      _id
      name
      mehfilDate
      karkunCount
    }
  }
`;

export default ALL_MEHFILS;
