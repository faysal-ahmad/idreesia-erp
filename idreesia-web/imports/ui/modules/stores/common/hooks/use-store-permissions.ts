import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  StorePermissionsQuery,
  StorePermissionsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const STORE_PERMISSIONS: TypedDocumentNode<
  StorePermissionsQuery,
  StorePermissionsQueryVariables
> = gql`
  query storePermissions {
    allAccessiblePhysicalStores {
      _id
      permissions
    }
  }
`;

/**
 * What the caller may do on one store (permissions are held per store).
 * `can(...)` is true when any of the given permissions is held.
 */
export const useStorePermissions = (physicalStoreId: string) => {
  const { data, loading } = useQuery(STORE_PERMISSIONS);
  const held =
    data?.allAccessiblePhysicalStores?.find(
      store => store?._id === physicalStoreId
    )?.permissions ?? [];
  const can = (...permissions: string[]) =>
    permissions.some(permission => held.includes(permission));
  return { can, loading };
};
