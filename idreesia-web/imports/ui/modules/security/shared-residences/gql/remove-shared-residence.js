import gql from 'graphql-tag';

export const REMOVE_SHARED_RESIDENCE = gql`
  mutation removeSharedResidence($_id: String!) {
    removeSharedResidence(_id: $_id)
  }
`;
