import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';

import {
  MOBILE_MY_COMMITTEE_LOCATIONS,
  MOBILE_MY_DUTIES_ATTENDANCE_LOCATIONS,
  MOBILE_MY_MEHFIL_DETAILS_LOCATIONS,
  MOBILE_MY_MEHFIL_PERMISSIONS_LOCATIONS,
} from './gql';

/** One row of the location selector, in tree order. */
export interface LocationRow {
  id: string;
  name: string;
  /** root, country, group (zone), city or mehfil. */
  type: string;
  depth: number;
  /** "Pakistan › Karachi": the ancestors' names, then this one's. */
  path: string;
  /** Ancestors kept only for context have nothing for the user: not selectable. */
  selectable: boolean;
}

/** The location features the user can open at one location. */
export interface LocationFeatures {
  mehfilDetails: boolean;
  mehfilPermissions: boolean;
  dutiesAttendance: boolean;
}

interface PlainLocation {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
}

const NO_FEATURES: LocationFeatures = {
  mehfilDetails: false,
  mehfilPermissions: false,
  dutiesAttendance: false,
};

/**
 * The locations the Workspaces tab is organised by: where the user's
 * committees are, and where they can open Mehfil Details, Mehfil Permissions
 * or Duties & Attendance, plus all their ancestors for context. Mirrors the
 * web's Workspaces sidebar. `cache-and-network`, so it reads offline too.
 *
 * @param committeeLocationIds the `locationId` of each of the user's committees.
 */
export const useWorkspaceLocations = (committeeLocationIds: string[]) => {
  const options = { fetchPolicy: 'cache-and-network' } as const;
  const committeeQuery = useQuery(MOBILE_MY_COMMITTEE_LOCATIONS, options);
  const dutiesQuery = useQuery(MOBILE_MY_DUTIES_ATTENDANCE_LOCATIONS, options);
  const detailsQuery = useQuery(MOBILE_MY_MEHFIL_DETAILS_LOCATIONS, options);
  const permissionsQuery = useQuery(MOBILE_MY_MEHFIL_PERMISSIONS_LOCATIONS, options);

  const committeeRows = committeeQuery.data?.myCommitteeLocations;
  const dutiesRows = dutiesQuery.data?.myDutiesAttendanceLocations;
  const detailsRows = detailsQuery.data?.myMehfilDetailsLocations;
  const permissionsRows = permissionsQuery.data?.myMehfilPermissionsLocations;
  const idsSignature = committeeLocationIds.join(',');

  const { locations, featuresByLocation } = useMemo(() => {
    const byId = new Map<string, PlainLocation>();
    const add = (
      id: string | null | undefined,
      name?: string | null,
      type?: string | null,
      parentId?: string | null,
    ) => {
      if (id && !byId.has(id)) {
        byId.set(id, { id, name: name ?? '', type: type ?? '', parentId: parentId ?? null });
      }
    };
    (committeeRows ?? []).forEach(row => add(row?._id, row?.name, row?.type, row?.parentId));
    const featureRows = [dutiesRows, detailsRows, permissionsRows];
    featureRows.forEach(rows => rows?.forEach(row => add(row?.locationId, row?.name, row?.type, row?.parentId)));

    const features = new Map<string, LocationFeatures>();
    const flag = (rows: typeof dutiesRows, key: keyof LocationFeatures) =>
      rows?.forEach(row => {
        if (!row?.locationId || !row.hasWorkspace) return;
        features.set(row.locationId, { ...(features.get(row.locationId) ?? NO_FEATURES), [key]: true });
      });
    flag(dutiesRows, 'dutiesAttendance');
    flag(detailsRows, 'mehfilDetails');
    flag(permissionsRows, 'mehfilPermissions');

    // A location can be picked when the user has a committee or a location
    // feature there; ancestors without either stay in the tree for context.
    const hasContent = new Set<string>([...idsSignature.split(',').filter(Boolean), ...features.keys()]);

    const children = new Map<string | null, PlainLocation[]>();
    byId.forEach(location => {
      const parent = location.parentId && byId.has(location.parentId) ? location.parentId : null;
      children.set(parent, [...(children.get(parent) ?? []), location]);
    });
    const rows: LocationRow[] = [];
    const walk = (parent: string | null, depth: number, parentPath: string) =>
      (children.get(parent) ?? [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(location => {
          const path = parentPath ? `${parentPath} › ${location.name}` : location.name;
          rows.push({
            id: location.id,
            name: location.name,
            type: location.type,
            depth,
            path,
            selectable: hasContent.has(location.id),
          });
          walk(location.id, depth + 1, path);
        });
    walk(null, 0, '');
    return { locations: rows, featuresByLocation: features };
  }, [committeeRows, dutiesRows, detailsRows, permissionsRows, idsSignature]);

  const queries = [committeeQuery, dutiesQuery, detailsQuery, permissionsQuery];
  const hasData = committeeRows != null;
  return {
    locations,
    featuresAt: (locationId: string): LocationFeatures =>
      featuresByLocation.get(locationId) ?? NO_FEATURES,
    loading: !hasData && queries.some(query => query.loading),
    error: hasData ? undefined : queries.find(query => query.error)?.error,
    refetch: () => Promise.all(queries.map(query => query.refetch())),
  };
};
