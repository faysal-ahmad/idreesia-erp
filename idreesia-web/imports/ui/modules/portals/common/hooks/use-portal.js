import { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

const QUERY = gql`
  query portalById($_id: String!) {
    portalById(_id: $_id) {
      _id
      name
      cityIds
    }
  }
`;

const usePortal = () => {
  const { portalId } = useParams();
  const { data, loading, refetch } = useQuery(QUERY, {
    variables: {
      _id: portalId,
    },
  });

  useEffect(() => {
    refetch();
  }, [portalId]);

  return {
    portal: data ? data.portalById : null,
    portalLoading: loading,
  };
};

export default usePortal;
