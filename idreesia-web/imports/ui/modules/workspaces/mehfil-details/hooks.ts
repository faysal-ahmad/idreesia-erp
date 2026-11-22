import { useQuery } from '@apollo/client/react';

import type { MyMehfilDetailsLocationsQuery } from 'meteor/idreesia-common/types/client-operations';

import { MY_MEHFIL_DETAILS_LOCATIONS } from './gql';

export type MyMehfilDetailsLocation = NonNullable<
  NonNullable<MyMehfilDetailsLocationsQuery['myMehfilDetailsLocations']>[number]
>;

// The mehfils whose details the user can open (and their ancestors, for the
// sidebar's location tree).
export const useMyMehfilDetailsLocations = () => {
  const { data, loading } = useQuery(MY_MEHFIL_DETAILS_LOCATIONS, {
    fetchPolicy: 'cache-and-network',
  });

  const locations = (data?.myMehfilDetailsLocations ?? []).filter(
    (row): row is MyMehfilDetailsLocation => row != null
  );
  return { locations, loading: loading && !data };
};
