import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  ReferencePhysicalStoresQuery,
  ReferencePhysicalStoresQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const QUERY: TypedDocumentNode<
  ReferencePhysicalStoresQuery,
  ReferencePhysicalStoresQueryVariables
> = gql`
  query referencePhysicalStores {
    referencePhysicalStores {
      _id
      name
      address
    }
  }
`;

const useReferencePhysicalStores = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    referencePhysicalStores: data?.referencePhysicalStores ?? null,
    referencePhysicalStoresLoading: loading,
  };
};

export default useReferencePhysicalStores;
