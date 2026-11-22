import { useQuery } from '@apollo/client/react';

import type { MyMehfilKarkunsLocationsQuery } from 'meteor/idreesia-common/types/client-operations';

import { MY_MEHFIL_KARKUNS_LOCATIONS } from './gql';

export type MyMehfilKarkunsLocation = NonNullable<
  NonNullable<MyMehfilKarkunsLocationsQuery['myMehfilKarkunsLocations']>[number]
>;

// The mehfils whose karkuns the user can see (and their ancestors, for the
// sidebar's location tree).
export const useMyMehfilKarkunsLocations = () => {
  const { data, loading } = useQuery(MY_MEHFIL_KARKUNS_LOCATIONS, {
    fetchPolicy: 'cache-and-network',
  });

  const locations = (data?.myMehfilKarkunsLocations ?? []).filter(
    (row): row is MyMehfilKarkunsLocation => row != null
  );
  return { locations, loading: loading && !data };
};
