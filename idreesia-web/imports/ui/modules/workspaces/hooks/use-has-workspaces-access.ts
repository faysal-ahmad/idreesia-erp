import { useMyDutiesAttendanceLocations } from '../duties-attendance';
import { useMyMehfilDetailsLocations } from '../mehfil-details';
import { useMyMehfilKarkunsLocations } from '../mehfil-karkuns';
import { useMyMehfilPermissionsLocations } from '../mehfil-permissions';
import { useMyCommittees } from './use-my-committees';

// Whether the user can open at least one workspace: a committee they belong
// to, or a location they have a workspace feature for. Mirrors what the
// workspaces sidebar lists as selectable.
export const useHasWorkspacesAccess = () => {
  const { committees, loading: committeesLoading } = useMyCommittees();
  const { locations: da, loading: daLoading } =
    useMyDutiesAttendanceLocations();
  const { locations: details, loading: detailsLoading } =
    useMyMehfilDetailsLocations();
  const { locations: karkuns, loading: karkunsLoading } =
    useMyMehfilKarkunsLocations();
  const { locations: permissions, loading: permissionsLoading } =
    useMyMehfilPermissionsLocations();

  const hasAccess =
    committees.length > 0 ||
    [da, details, karkuns, permissions].some((list) =>
      list.some((location) => location.hasWorkspace)
    );

  return {
    hasAccess,
    loading:
      committeesLoading ||
      daLoading ||
      detailsLoading ||
      karkunsLoading ||
      permissionsLoading,
  };
};
