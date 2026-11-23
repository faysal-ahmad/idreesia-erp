import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePurchasingOrderMutation,
  CreatePurchasingOrderMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_PURCHASING_ORDER: TypedDocumentNode<
  CreatePurchasingOrderMutation,
  CreatePurchasingOrderMutationVariables
> = gql`
  mutation createPurchasingOrder($vendorId: String!, $orderDate: String!, $expectedDeliveryDate: String, $deliveryAddress: String, $paymentTermsDays: Int, $notes: String, $discount: Float, $shipping: Float, $lines: [PurchasingPricedLineInput!]!) {
    createPurchasingOrder(vendorId: $vendorId, orderDate: $orderDate, expectedDeliveryDate: $expectedDeliveryDate, deliveryAddress: $deliveryAddress, paymentTermsDays: $paymentTermsDays, notes: $notes, discount: $discount, shipping: $shipping, lines: $lines) {
      _id
    }
  }
`;

export default CREATE_PURCHASING_ORDER;
