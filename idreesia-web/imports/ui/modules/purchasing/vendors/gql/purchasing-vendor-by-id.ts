import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingVendorByIdQuery,
  PurchasingVendorByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_VENDOR_BY_ID: TypedDocumentNode<
  PurchasingVendorByIdQuery,
  PurchasingVendorByIdQueryVariables
> = gql`
  query purchasingVendorById($_id: String!) {
    purchasingVendorById(_id: $_id) {
      _id
      name
      contactPerson
      phone
      email
      address
      taxId
      paymentTermsDays
      bankName
      bankAccountTitle
      bankAccountNumber
      notes
      isActive
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default PURCHASING_VENDOR_BY_ID;
