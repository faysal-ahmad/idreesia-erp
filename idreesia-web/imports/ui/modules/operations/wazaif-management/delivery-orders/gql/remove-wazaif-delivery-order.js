import gql from 'graphql-tag';

export const REMOVE_WAZAIF_DELIVERY_ORDER = gql`
  mutation removeWazaifDeliveryOrder($_id: String!) {
    removeWazaifDeliveryOrder(_id: $_id)
  }
`;
