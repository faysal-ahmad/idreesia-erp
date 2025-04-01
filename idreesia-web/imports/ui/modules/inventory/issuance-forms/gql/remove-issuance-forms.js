import gql from 'graphql-tag';

export const REMOVE_ISSUANCE_FORMS = gql`
  mutation removeIssuanceForms($physicalStoreId: String!, $_ids: [String]!) {
    removeIssuanceForms(physicalStoreId: $physicalStoreId, _ids: $_ids)
  }
`;
