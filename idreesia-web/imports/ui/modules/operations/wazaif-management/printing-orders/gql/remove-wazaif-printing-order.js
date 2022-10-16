import gql from 'graphql-tag';

export const REMOVE_WAZAIF_PRINTING_ORDER = gql`
  mutation removeWazaifPrintingOrder($_id: String!) {
    removeWazaifPrintingOrder(_id: $_id)
  }
`;
