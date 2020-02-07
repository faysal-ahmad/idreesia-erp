import gql from 'graphql-tag';

const REMOVE_MEHFIL = gql`
  mutation removeMehfil($_id: String!) {
    removeMehfil(_id: $_id)
  }
`;

export default REMOVE_MEHFIL;
