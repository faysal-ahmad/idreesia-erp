import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import type {
  CommonAllCityMehfilLocationsQuery,
  CommonAllCityMehfilLocationsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export interface CityLocationOption {
  _id: string;
  name: string;
}

export interface MehfilLocationOption {
  _id: string;
  // The city location the mehfil sits under.
  cityId: string;
  name: string;
}

const QUERY: TypedDocumentNode<
  CommonAllCityMehfilLocationsQuery,
  CommonAllCityMehfilLocationsQueryVariables
> = gql`
  query commonAllCityMehfilLocations {
    referenceCityMehfilLocations {
      _id
      name
      type
      parentId
    }
  }
`;

// The city and mehfil org locations, for picking where a karkun belongs.
const useAllCityMehfilLocations = () => {
  const { data, loading } = useQuery(QUERY);
  const locations = data?.referenceCityMehfilLocations ?? [];

  const cityLocations: CityLocationOption[] = [];
  const mehfilLocations: MehfilLocationOption[] = [];
  locations.forEach(location => {
    if (!location?._id || location.name == null) return;
    if (location.type === OrgLocationTypes.CITY) {
      cityLocations.push({ _id: location._id, name: location.name });
    } else if (location.type === OrgLocationTypes.MEHFIL && location.parentId) {
      mehfilLocations.push({
        _id: location._id,
        cityId: location.parentId,
        name: location.name,
      });
    }
  });

  return {
    cityLocations,
    mehfilLocations,
    cityMehfilLocationsLoading: loading,
  };
};

export default useAllCityMehfilLocations;
