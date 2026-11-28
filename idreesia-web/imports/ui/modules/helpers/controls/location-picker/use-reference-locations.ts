import { useMemo } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

import type {
  ReferenceOrgLocationsQuery,
  ReferenceOrgLocationsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import type { PickerLocation } from './types';

const REFERENCE_ORG_LOCATIONS: TypedDocumentNode<
  ReferenceOrgLocationsQuery,
  ReferenceOrgLocationsQueryVariables
> = gql`
  query referenceOrgLocations($types: [String!]) {
    referenceOrgLocations(types: $types) {
      _id
      name
      type
      parentId
    }
  }
`;

/**
 * The organization locations for a location picker: those of the given types
 * (all when none are given) plus their ancestors.
 */
export function useReferenceLocations(types?: string[]) {
  const { data, loading } = useQuery(REFERENCE_ORG_LOCATIONS, {
    variables: { types: types && types.length > 0 ? types : null },
  });
  const locations = useMemo<PickerLocation[]>(
    () =>
      (data?.referenceOrgLocations ?? []).flatMap(location =>
        location?._id ? [{ ...location, _id: location._id }] : []
      ),
    [data]
  );
  return { locations, loading };
}
