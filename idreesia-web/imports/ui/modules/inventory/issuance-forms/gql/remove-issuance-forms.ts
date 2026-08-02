import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemoveIssuanceFormsMutation,
  RemoveIssuanceFormsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const REMOVE_ISSUANCE_FORMS: TypedDocumentNode<
  RemoveIssuanceFormsMutation,
  RemoveIssuanceFormsMutationVariables
> = gql`
  mutation removeIssuanceForms($physicalStoreId: String!, $_ids: [String]!) {
    removeIssuanceForms(physicalStoreId: $physicalStoreId, _ids: $_ids)
  }
`;
