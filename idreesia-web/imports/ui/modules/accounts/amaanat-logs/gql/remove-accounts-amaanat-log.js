import gql from 'graphql-tag';

const REMOVE_ACCOUNTS_AMAANAT_LOG = gql`
  mutation removeAccountsAmaanatLog($_id: String!) {
    removeAccountsAmaanatLog(_id: $_id)
  }
`;

export default REMOVE_ACCOUNTS_AMAANAT_LOG;
