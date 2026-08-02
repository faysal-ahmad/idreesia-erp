import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  AdminAllPhysicalStoresQuery,
  AdminAllPhysicalStoresQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const QUERY: TypedDocumentNode<
  AdminAllPhysicalStoresQuery,
  AdminAllPhysicalStoresQueryVariables
> = gql`
  query adminAllPhysicalStores {
    allPhysicalStores {
      _id
      name
      address
    }
  }
`;

const useAllPhysicalStores = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    allPhysicalStores: data?.allPhysicalStores ?? null,
    allPhysicalStoresLoading: loading,
  };
};

export default useAllPhysicalStores;
