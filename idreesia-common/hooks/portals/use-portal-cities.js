import { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

const QUERY = gql`
  query citiesByPortalId($portalId: String!) {
    citiesByPortalId(portalId: $portalId) {
      _id
      name
      country
    }
  }
`;

const usePortalCities = () => {
  const { portalId } = useParams();
  const { data, loading, refetch } = useQuery(QUERY, {
    variables: {
      portalId,
    },
  });

  useEffect(() => {
    refetch();
  }, [portalId]);

  return {
    portalCities: data ? data.citiesByPortalId : null,
    portalCitiesLoading: loading,
  };
};

export default usePortalCities;
