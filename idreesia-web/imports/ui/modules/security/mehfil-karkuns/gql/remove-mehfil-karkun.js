import gql from 'graphql-tag';

export const REMOVE_MEHFIL_KARKUN = gql`
  mutation removeMehfilKarkun($_id: String!) {
    removeMehfilKarkun(_id: $_id)
  }
`;
