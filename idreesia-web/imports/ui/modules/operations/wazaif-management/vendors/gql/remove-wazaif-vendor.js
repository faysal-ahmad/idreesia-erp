import gql from 'graphql-tag';

export const REMOVE_WAZAIF_VENDOR = gql`
  mutation removeWazaifVendor($_id: String!) {
    removeWazaifVendor(_id: $_id)
  }
`;
