import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  CommonAllCitiesQuery,
  CommonAllCitiesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export interface CityOption {
  _id: string;
  name: string;
  peripheryOf?: string | null;
  country?: string | null;
}

const QUERY: TypedDocumentNode<
  CommonAllCitiesQuery,
  CommonAllCitiesQueryVariables
> = gql`
  query commonAllCities {
    allCities {
      _id
      name
      peripheryOf
      country
    }
  }
`;

const normalizeCities = (
  cities: CommonAllCitiesQuery['allCities']
): CityOption[] | null => {
  if (!cities) return null;
  return cities.flatMap((city) => {
    if (!city?._id || city.name == null) return [];
    return [
      {
        _id: city._id,
        name: city.name,
        peripheryOf: city.peripheryOf,
        country: city.country,
      },
    ];
  });
};

const useAllCities = () => {
  const { data, loading } = useQuery(QUERY);
  return {
    allCities: normalizeCities(data?.allCities ?? null),
    allCitiesLoading: loading,
  };
};

export default useAllCities;
