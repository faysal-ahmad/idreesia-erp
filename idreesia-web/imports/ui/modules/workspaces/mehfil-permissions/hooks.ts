import { useQuery } from '@apollo/client/react';

import type { MyMehfilPermissionsLocationsQuery } from 'meteor/idreesia-common/types/client-operations';

import { MY_MEHFIL_PERMISSIONS_LOCATIONS } from './gql';

export type MyMehfilPermissionsLocation = NonNullable<
  NonNullable<
    MyMehfilPermissionsLocationsQuery['myMehfilPermissionsLocations']
  >[number]
>;

// The mehfils whose permissions the user can open (and their ancestors, for
// the sidebar's location tree).
export const useMyMehfilPermissionsLocations = () => {
  const { data, loading } = useQuery(MY_MEHFIL_PERMISSIONS_LOCATIONS, {
    fetchPolicy: 'cache-and-network',
  });

  const locations = (data?.myMehfilPermissionsLocations ?? []).filter(
    (row): row is MyMehfilPermissionsLocation => row != null
  );
  return { locations, loading: loading && !data };
};
