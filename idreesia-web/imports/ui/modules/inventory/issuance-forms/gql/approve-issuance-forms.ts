import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ApproveIssuanceFormsMutation,
  ApproveIssuanceFormsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const APPROVE_ISSUANCE_FORMS: TypedDocumentNode<
  ApproveIssuanceFormsMutation,
  ApproveIssuanceFormsMutationVariables
> = gql`
  mutation approveIssuanceForms($physicalStoreId: String!, $_ids: [String]!) {
    approveIssuanceForms(physicalStoreId: $physicalStoreId, _ids: $_ids) {
      _id
      issueDate
      issuedBy
      issuedTo
      locationId
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        isInflow
      }
      refIssuedTo {
        _id
        name
      }
    }
  }
`;
