import gql from 'graphql-tag';

export const REMOVE_RESIDENT = gql`
  mutation removeResident($_id: String!) {
    removeResident(_id: $_id)
  }
`;
