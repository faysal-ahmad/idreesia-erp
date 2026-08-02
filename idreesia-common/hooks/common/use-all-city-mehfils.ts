import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  CommonAllCityMehfilsQuery,
  CommonAllCityMehfilsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export interface CityMehfilOption {
  _id: string;
  cityId: string;
  name: string;
  address?: string | null;
}

const QUERY: TypedDocumentNode<
  CommonAllCityMehfilsQuery,
  CommonAllCityMehfilsQueryVariables
> = gql`
  query commonAllCityMehfils {
    allCityMehfils {
      _id
      cityId
      name
      address
    }
  }
`;

const normalizeCityMehfils = (
  mehfils: CommonAllCityMehfilsQuery['allCityMehfils']
): CityMehfilOption[] | null => {
  if (!mehfils) return null;
  return mehfils.flatMap((mehfil) => {
    if (!mehfil?._id || mehfil.cityId == null || mehfil.name == null) return [];
    return [
      {
        _id: mehfil._id,
        cityId: mehfil.cityId,
        name: mehfil.name,
        address: mehfil.address,
      },
    ];
  });
};

const useAllCityMehfils = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    allCityMehfils: normalizeCityMehfils(data?.allCityMehfils ?? null),
    allCityMehfilsLoading: loading,
  };
};

export default useAllCityMehfils;
