import { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

const QUERY = gql`
  query physicalStoreById($id: String!) {
    physicalStoreById(id: $id) {
      _id
      name
    }
  }
`;

export const usePhysicalStore = () => {
  const { physicalStoreId } = useParams();
  const { data, loading, refetch } = useQuery(QUERY, {
    variables: {
      id: physicalStoreId,
    },
  });

  useEffect(() => {
    refetch();
  }, [physicalStoreId]);

  return {
    physicalStore: data ? data.physicalStoreById : null,
    physicalStoreLoading: loading,
  };
};
