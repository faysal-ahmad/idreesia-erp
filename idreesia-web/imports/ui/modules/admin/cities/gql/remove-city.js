import gql from 'graphql-tag';

const REMOVE_CITY = gql`
  mutation removeCity($_id: String!) {
    removeCity(_id: $_id)
  }
`;

export default REMOVE_CITY;
