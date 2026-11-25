import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingQuoteByIdQuery,
  PurchasingQuoteByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_QUOTE_BY_ID: TypedDocumentNode<
  PurchasingQuoteByIdQuery,
  PurchasingQuoteByIdQueryVariables
> = gql`
  query purchasingQuoteById($_id: String!) {
    purchasingQuoteById(_id: $_id) {
      _id
      requisitionId
      vendorId
      vendor {
        _id
        name
      }
      reference
      quoteDate
      validUntil
      total
      status
      version
      notes
      lines {
        _id
        requisitionLineId
        internalCatalogId
        description
        unit
        quantity
        unitPrice
      }
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default PURCHASING_QUOTE_BY_ID;
