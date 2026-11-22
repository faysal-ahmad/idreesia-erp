import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingPayablesAgingQuery,
  PurchasingPayablesAgingQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_PAYABLES_AGING: TypedDocumentNode<
  PurchasingPayablesAgingQuery,
  PurchasingPayablesAgingQueryVariables
> = gql`
  query purchasingPayablesAging {
    purchasingPayablesAging {
      vendorId
      vendor {
        _id
        name
      }
      current
      days1To30
      days31To60
      days61Plus
      total
    }
  }
`;

export default PURCHASING_PAYABLES_AGING;
