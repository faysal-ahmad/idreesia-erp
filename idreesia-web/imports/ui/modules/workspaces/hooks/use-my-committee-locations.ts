import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

import type {
  MyCommitteeLocationsQuery,
  MyCommitteeLocationsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export type MyCommitteeLocation = NonNullable<
  NonNullable<MyCommitteeLocationsQuery['myCommitteeLocations']>[number]
>;

const MY_COMMITTEE_LOCATIONS: TypedDocumentNode<
  MyCommitteeLocationsQuery,
  MyCommitteeLocationsQueryVariables
> = gql`
  query myCommitteeLocations {
    myCommitteeLocations {
      _id
      name
      type
      parentId
    }
  }
`;

// Locations of the user's committees plus all their ancestors, used to show
// the committees in the location hierarchy.
export const useMyCommitteeLocations = () => {
  const { data, loading } = useQuery(MY_COMMITTEE_LOCATIONS, {
    fetchPolicy: 'cache-and-network',
  });

  const locations = (data?.myCommitteeLocations ?? []).filter(
    (row): row is MyCommitteeLocation => row != null && row._id != null
  );

  return { locations, loading: loading && !data };
};
