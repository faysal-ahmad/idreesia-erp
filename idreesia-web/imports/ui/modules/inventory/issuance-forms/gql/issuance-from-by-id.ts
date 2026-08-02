import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  IssuanceFormByIdQuery,
  IssuanceFormByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const ISSUANCE_FORM_BY_ID: TypedDocumentNode<
  IssuanceFormByIdQuery,
  IssuanceFormByIdQueryVariables
> = gql`
  query issuanceFormById($physicalStoreId: String!, $_id: String!) {
    issuanceFormById(physicalStoreId: $physicalStoreId, _id: $_id) {
      _id
      issueDate
      issuedBy
      issuedTo
      handedOverTo
      locationId
      physicalStoreId
      createdAt
      createdBy
      updatedAt
      updatedBy
      approvedOn
      approvedBy
      items {
        stockItemId
        quantity
        isInflow
        refStockItem {
          _id
          name
          unitOfMeasurement
        }
      }
      refLocation {
        _id
        name
      }
      refIssuedBy {
        _id
        name
      }
      refIssuedTo {
        _id
        name
      }
      notes
      attachments {
        _id
        name
        description
        mimeType
      }
    }
  }
`;
