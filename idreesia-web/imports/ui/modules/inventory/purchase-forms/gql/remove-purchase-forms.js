import gql from 'graphql-tag';

export const REMOVE_PURCHASE_FORMS = gql`
  mutation removePurchaseForms($physicalStoreId: String!, $_ids: [String]!) {
    removePurchaseForms(physicalStoreId: $physicalStoreId, _ids: $_ids)
  }
`;
