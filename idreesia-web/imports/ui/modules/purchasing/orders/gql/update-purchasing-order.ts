import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdatePurchasingOrderMutation,
  UpdatePurchasingOrderMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_PURCHASING_ORDER: TypedDocumentNode<
  UpdatePurchasingOrderMutation,
  UpdatePurchasingOrderMutationVariables
> = gql`
  mutation updatePurchasingOrder($_id: String!, $version: Int!, $vendorId: String!, $orderDate: String!, $expectedDeliveryDate: String, $deliveryAddress: String, $paymentTermsDays: Int, $notes: String, $discount: Float, $shipping: Float, $lines: [PurchasingPricedLineInput!]!) {
    updatePurchasingOrder(_id: $_id, version: $version, vendorId: $vendorId, orderDate: $orderDate, expectedDeliveryDate: $expectedDeliveryDate, deliveryAddress: $deliveryAddress, paymentTermsDays: $paymentTermsDays, notes: $notes, discount: $discount, shipping: $shipping, lines: $lines) {
      _id
      version
    }
  }
`;

export default UPDATE_PURCHASING_ORDER;
