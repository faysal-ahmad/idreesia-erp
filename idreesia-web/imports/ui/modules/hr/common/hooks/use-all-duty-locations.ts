import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import type {
  ComposerAllDutyLocationsQuery,
  ComposerAllDutyLocationsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_DUTY_LOCATIONS_QUERY: TypedDocumentNode<
  ComposerAllDutyLocationsQuery,
  ComposerAllDutyLocationsQueryVariables
> = gql`
  query composerAllDutyLocations {
    allDutyLocations {
      _id
      name
    }
  }
`;

export const useAllDutyLocations = () => {
  const { data, loading, ...queryResult } = useQuery(ALL_DUTY_LOCATIONS_QUERY);

  return {
    ...queryResult,
    loading,
    allDutyLocationsLoading: loading,
    allDutyLocations: data?.allDutyLocations ?? null,
  };
};
