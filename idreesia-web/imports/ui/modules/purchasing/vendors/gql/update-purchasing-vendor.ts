import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdatePurchasingVendorMutation,
  UpdatePurchasingVendorMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_PURCHASING_VENDOR: TypedDocumentNode<
  UpdatePurchasingVendorMutation,
  UpdatePurchasingVendorMutationVariables
> = gql`
  mutation updatePurchasingVendor($_id: String!, $name: String!, $contactPerson: String, $phone: String, $email: String, $address: String, $taxId: String, $paymentTermsDays: Int, $bankName: String, $bankAccountTitle: String, $bankAccountNumber: String, $notes: String) {
    updatePurchasingVendor(_id: $_id, name: $name, contactPerson: $contactPerson, phone: $phone, email: $email, address: $address, taxId: $taxId, paymentTermsDays: $paymentTermsDays, bankName: $bankName, bankAccountTitle: $bankAccountTitle, bankAccountNumber: $bankAccountNumber, notes: $notes) {
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

export default UPDATE_PURCHASING_VENDOR;
