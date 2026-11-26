import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ManagedPhysicalStoresQuery,
  ManagedPhysicalStoresQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const MANAGED_PHYSICAL_STORES: TypedDocumentNode<
  ManagedPhysicalStoresQuery,
  ManagedPhysicalStoresQueryVariables
> = gql`
  query managedPhysicalStores {
    managedPhysicalStores {
      _id
      name
      address
    }
  }
`;

export default MANAGED_PHYSICAL_STORES;
