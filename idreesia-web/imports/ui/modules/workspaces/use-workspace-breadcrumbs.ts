import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';

import { default as paths } from './submodule-paths';
import { default as names } from './submodule-names';
import { useMyCommittees } from './hooks/use-my-committees';
import { useMyCommitteeLocations } from './hooks/use-my-committee-locations';

type Entry = { path: string; feature: string; scope: 'committee' | 'location' };

// More specific paths first.
const ENTRIES: Entry[] = [
  { path: paths.committeeMembersPath(), feature: names.members, scope: 'committee' },
  { path: paths.committeeDiscussionsPath(), feature: names.discussions, scope: 'committee' },
  { path: paths.committeeDocumentsPath(), feature: names.documents, scope: 'committee' },
  { path: paths.committeeMeetingPath(), feature: names.meetings, scope: 'committee' },
  { path: paths.committeeMeetingsPath(), feature: names.meetings, scope: 'committee' },
  { path: paths.committeePollPath(), feature: names.polls, scope: 'committee' },
  { path: paths.committeePollsPath(), feature: names.polls, scope: 'committee' },
  { path: paths.committeeProjectPath(), feature: names.projects, scope: 'committee' },
  { path: paths.committeeProjectsPath(), feature: names.projects, scope: 'committee' },
  { path: paths.committeeNightStayReportPath(), feature: names.nightStayReport, scope: 'committee' },
  { path: paths.committeeMonitoringAlertsPath(), feature: names.monitoringAlerts, scope: 'committee' },
  { path: paths.committeeMonitoringProfilesPath(), feature: names.monitoringProfiles, scope: 'committee' },
  { path: paths.locationDutiesPath(), feature: names.duties, scope: 'location' },
  { path: paths.locationDutyPlanningPath(), feature: names.dutyPlanning, scope: 'location' },
  { path: paths.locationDutyAttendancePath(), feature: names.dutyAttendance, scope: 'location' },
  { path: paths.locationAttendanceSheetPath(), feature: names.attendanceSheet, scope: 'location' },
  { path: paths.locationMehfilDetailsPath(), feature: names.mehfilDetails, scope: 'location' },
  { path: paths.locationMehfilPermissionsPath(), feature: names.mehfilPermissions, scope: 'location' },
];

// Sets the layout breadcrumbs for whichever Workspaces page is showing:
// Workspaces > <committee or location> > <feature>.
export const useWorkspaceBreadcrumbs = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { committees } = useMyCommittees();
  const { locations } = useMyCommitteeLocations();

  // Derive a stable string so the effect only fires when the crumbs change
  // (the hook results are new arrays on every render).
  let crumbs = ['Workspaces'];
  for (const entry of ENTRIES) {
    const match = matchPath<{ committeeId?: string; locationId?: string }>(
      pathname,
      { path: entry.path }
    );
    if (!match) continue;

    const locationName = locations.find(
      row => row._id === match.params.locationId
    )?.name;
    const committeeName =
      entry.scope === 'committee'
        ? committees.find(row => row._id === match.params.committeeId)?.name
        : '';
    crumbs = [
      'Workspaces',
      locationName ?? '',
      committeeName ?? '',
      entry.feature,
    ].filter(Boolean);
    break;
  }
  const crumbsKey = JSON.stringify(crumbs);

  useEffect(() => {
    dispatch(setBreadcrumbs(JSON.parse(crumbsKey)));
  }, [dispatch, crumbsKey]);
};
