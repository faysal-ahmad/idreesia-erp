import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePurchasingVendorMutation,
  CreatePurchasingVendorMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_PURCHASING_VENDOR: TypedDocumentNode<
  CreatePurchasingVendorMutation,
  CreatePurchasingVendorMutationVariables
> = gql`
  mutation createPurchasingVendor($name: String!, $contactPerson: String, $phone: String, $email: String, $address: String, $taxId: String, $paymentTermsDays: Int, $bankName: String, $bankAccountTitle: String, $bankAccountNumber: String, $notes: String) {
    createPurchasingVendor(name: $name, contactPerson: $contactPerson, phone: $phone, email: $email, address: $address, taxId: $taxId, paymentTermsDays: $paymentTermsDays, bankName: $bankName, bankAccountTitle: $bankAccountTitle, bankAccountNumber: $bankAccountNumber, notes: $notes) {
      _id
    }
  }
`;

export default CREATE_PURCHASING_VENDOR;
