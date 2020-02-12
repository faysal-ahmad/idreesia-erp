import { useEffect } from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

const QUERY = gql`
  query cityMehfilsByPortalId($portalId: String!) {
    cityMehfilsByPortalId(portalId: $portalId) {
      _id
      cityId
      name
      address
    }
  }
`;

const usePortalCityMehfils = () => {
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
    portalCityMehfils: data ? data.cityMehfilsByPortalId : null,
    portalCityMehfilsLoading: loading,
  };
};

export default usePortalCityMehfils;
