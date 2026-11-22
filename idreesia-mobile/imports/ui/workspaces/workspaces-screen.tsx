import React, { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Badge, List, PullToRefresh } from 'antd-mobile';
import {
  BillOutline,
  CalendarOutline,
  CheckCircleOutline,
  CheckShieldOutline,
  ClockCircleOutline,
  ContentOutline,
  DownOutline,
  EnvironmentOutline,
  ExclamationShieldOutline,
  FileOutline,
  FolderOutline,
  MessageOutline,
  PieOutline,
  TeamOutline,
  UnorderedListOutline,
  UpOutline,
  UserContactOutline,
} from 'antd-mobile-icons';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/organization';
import { MoonOutline } from '../components/icons/moon-outline';
import { Page, PageEmpty, PageError, PageLoading } from '../layout';
import { useHistory } from '../router';
import { LocationPicker } from './location-picker';
import { WorkspacesPaths } from './paths';
import { useWorkspaceLocations } from './use-workspace-locations';
import { MOBILE_MY_COMMITTEES, MOBILE_MY_NOTIFICATION_COUNTS } from './gql';

// What each workspace offers, as in the web's Workspaces sidebar: each
// feature only when the committee has it enabled.
interface WorkspaceItem {
  key: string;
  title: string;
  icon: React.ReactNode;
  path: string;
}

const getWorkspaceItems = (
  committeeId: string,
  features: (string | null)[] | null | undefined,
): WorkspaceItem[] => [
  ...(features?.includes(CommitteeFeatureKeys.MEMBERS)
    ? [
        {
          key: 'members',
          title: 'Members',
          icon: <TeamOutline />,
          path: WorkspacesPaths.committeeMembers(committeeId),
        },
      ]
    : []),
  ...(features?.includes(CommitteeFeatureKeys.DISCUSSIONS)
    ? [
        {
          key: 'discussions',
          title: 'Discussions',
          icon: <MessageOutline />,
          path: WorkspacesPaths.committeeDiscussions(committeeId),
        },
      ]
    : []),
  ...(features?.includes(CommitteeFeatureKeys.MEETINGS)
    ? [
        {
          key: 'meetings',
          title: 'Meetings',
          icon: <CalendarOutline />,
          path: WorkspacesPaths.committeeMeetings(committeeId),
        },
      ]
    : []),
  ...(features?.includes(CommitteeFeatureKeys.POLLS)
    ? [
        {
          key: 'polls',
          title: 'Polls',
          icon: <PieOutline />,
          path: WorkspacesPaths.committeePolls(committeeId),
        },
      ]
    : []),
  ...(features?.includes(CommitteeFeatureKeys.PROJECTS)
    ? [
        {
          key: 'projects',
          title: 'Projects & Tasks',
          icon: <UnorderedListOutline />,
          path: WorkspacesPaths.committeeProjects(committeeId),
        },
      ]
    : []),
  ...(features?.includes(CommitteeFeatureKeys.DOCUMENTS)
    ? [
        {
          key: 'documents',
          title: 'Documents',
          icon: <FileOutline />,
          path: WorkspacesPaths.committeeDocuments(committeeId),
        },
      ]
    : []),
  ...(features?.includes(CommitteeFeatureKeys.NIGHT_STAY_REPORT)
    ? [
        {
          key: 'night-stay-report',
          title: 'Night Stay Report',
          icon: <MoonOutline />,
          path: WorkspacesPaths.committeeNightStayReport(committeeId),
        },
      ]
    : []),
  ...(features?.includes(CommitteeFeatureKeys.MONITORING_ALERTS)
    ? [
        {
          key: 'monitoring-alerts',
          title: 'Monitoring Alerts',
          icon: <ExclamationShieldOutline />,
          path: WorkspacesPaths.committeeMonitoringAlerts(committeeId),
        },
      ]
    : []),
  ...(features?.includes(CommitteeFeatureKeys.MONITORING_PROFILES)
    ? [
        {
          key: 'monitoring-profiles',
          title: 'Monitoring Profiles',
          icon: <UserContactOutline />,
          path: WorkspacesPaths.committeeMonitoringProfiles(committeeId),
        },
      ]
    : []),
];

// Notifications name the headless module that published them; a workspace
// item is keyed by feature. Modules not listed here use their own name.
const NOTIFICATION_MODULE_ITEM: Record<string, string> = { dms: 'documents' };

// A location's own features, as in the web's Workspaces sidebar.
interface LocationFeatureItem {
  key: string;
  title: string;
  icon: React.ReactNode;
  path: (locationId: string) => string;
}

const DUTIES_ATTENDANCE_PAGES: LocationFeatureItem[] = [
  { key: 'da', title: 'Duties', icon: <ContentOutline />, path: WorkspacesPaths.duties },
  { key: 'da', title: 'Duty Planning', icon: <CalendarOutline />, path: WorkspacesPaths.dutyPlanning },
  { key: 'da', title: 'Duty Attendance', icon: <CheckCircleOutline />, path: WorkspacesPaths.dutyAttendance },
  { key: 'da', title: 'Attendance Sheet', icon: <BillOutline />, path: WorkspacesPaths.attendanceSheet },
];

const SELECTED_LOCATION_STORAGE_KEY = 'workspaces-location';

const readStoredLocationId = (): string | null => {
  try {
    return window.localStorage.getItem(SELECTED_LOCATION_STORAGE_KEY);
  } catch {
    return null;
  }
};

const storeLocationId = (locationId: string) => {
  try {
    window.localStorage.setItem(SELECTED_LOCATION_STORAGE_KEY, locationId);
  } catch {
    // Remembering the selection is only a convenience.
  }
};

/**
 * Workspaces tab: pick a location, then see its location features and the
 * user's committees there, each committee expanding to its features.
 */
export const WorkspacesScreen = () => {
  const history = useHistory();
  // cache-and-network, so a membership added or removed on the web shows up
  // the next time the user comes back to this tab.
  const { data, loading, error, refetch } = useQuery(MOBILE_MY_COMMITTEES, {
    fetchPolicy: 'cache-and-network',
  });
  // Unread notifications: shown on a location and on its committees while
  // collapsed, and on a committee's module items once it is open. Best
  // effort; the tab works without.
  const { data: notificationData, refetch: refetchNotifications } = useQuery(
    MOBILE_MY_NOTIFICATION_COUNTS,
    { fetchPolicy: 'cache-and-network' },
  );
  const unread = useMemo(() => {
    const byCommittee = new Map<string, number>();
    const byItem = new Map<string, number>();
    (notificationData?.myNotificationCounts ?? []).forEach(row => {
      if (!row?.committeeId || !row.unreadCount) return;
      const { committeeId, module = '', unreadCount } = row;
      const itemKey = NOTIFICATION_MODULE_ITEM[module ?? ''] ?? module ?? '';
      byCommittee.set(committeeId, (byCommittee.get(committeeId) ?? 0) + unreadCount);
      const key = `${committeeId}-${itemKey}`;
      byItem.set(key, (byItem.get(key) ?? 0) + unreadCount);
    });
    return { byCommittee, byItem };
  }, [notificationData]);
  // One workspace open at a time; opening another closes the previous one.
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const committees = (data?.myCommittees ?? []).filter(
    (committee): committee is NonNullable<typeof committee> & { _id: string } =>
      committee?._id != null,
  );
  const committeeLocationIds = useMemo(
    () => committees.map(committee => committee.locationId ?? ''),
    [committees],
  );
  const locations = useWorkspaceLocations(committeeLocationIds);

  const refresh = () =>
    Promise.all([refetch(), refetchNotifications(), locations.refetch()]).then(
      () => undefined,
      () => undefined,
    );

  const toggle = (id: string) => setExpandedId(prev => (prev === id ? null : id));

  // Unread notifications per location: its committees' together.
  const unreadByLocation = useMemo(() => {
    const byLocation = new Map<string, number>();
    committees.forEach(committee => {
      const count = unread.byCommittee.get(committee._id);
      if (!count || !committee.locationId) return;
      byLocation.set(committee.locationId, (byLocation.get(committee.locationId) ?? 0) + count);
    });
    return byLocation;
  }, [committees, unread]);

  // The remembered location if it is still available, else the first one.
  const [storedLocationId, setStoredLocationId] = useState(readStoredLocationId);
  const selectable = locations.locations.filter(location => location.selectable);
  const selectedId =
    selectable.find(location => location.id === storedLocationId)?.id ?? selectable[0]?.id ?? '';
  const changeLocation = (locationId: string) => {
    setStoredLocationId(locationId);
    storeLocationId(locationId);
    setExpandedId(null);
  };

  const features = locations.featuresAt(selectedId);
  const locationCommittees = committees.filter(committee => committee.locationId === selectedId);
  const daId = `da-${selectedId}`;

  const renderLocationFeature = (title: string, key: string, icon: React.ReactNode, path: string) => (
    <List.Item
      key={key}
      onClick={() => history.push(path)}
      prefix={<span className={`workspace-feature-icon workspace-feature-icon-${key}`}>{icon}</span>}
    >
      {title}
    </List.Item>
  );

  const renderCommittees = () =>
    locationCommittees.flatMap(committee => {
      const expanded = expandedId === committee._id;
      return [
        <List.Item
          key={committee._id}
          arrowIcon={expanded ? <UpOutline /> : <DownOutline />}
          description={committee.description || undefined}
          prefix={
            <span className="list-icon">
              <FolderOutline />
            </span>
          }
          extra={
            !expanded && unread.byCommittee.get(committee._id) ? (
              <Badge className="workspaces-badge" content={unread.byCommittee.get(committee._id)} />
            ) : undefined
          }
          onClick={() => toggle(committee._id)}
        >
          {committee.name}
        </List.Item>,
        ...(expanded
          ? getWorkspaceItems(committee._id, committee.features).map(item => (
              <List.Item
                key={`${committee._id}-${item.key}`}
                className="workspaces-feature-item"
                extra={
                  unread.byItem.get(`${committee._id}-${item.key}`) ? (
                    <Badge className="workspaces-badge" content={unread.byItem.get(`${committee._id}-${item.key}`)} />
                  ) : undefined
                }
                onClick={() => history.push(item.path)}
                prefix={
                  <span className={`workspace-feature-icon workspace-feature-icon-${item.key}`}>
                    {item.icon}
                  </span>
                }
              >
                {item.title}
              </List.Item>
            ))
          : []),
      ];
    });

  let content;
  if ((loading && !data) || locations.loading) {
    content = <PageLoading />;
  } else if ((error && !data) || locations.error) {
    content = <PageError error={error ?? locations.error} onRetry={refresh} />;
  } else if (selectable.length === 0) {
    content = (
      <PullToRefresh onRefresh={refresh}>
        <PageEmpty title="No workspaces yet" description="You don't have access to any workspace." />
      </PullToRefresh>
    );
  } else {
    content = (
      <PullToRefresh onRefresh={refresh}>
        <LocationPicker
          locations={locations.locations}
          selectedId={selectedId}
          onChange={changeLocation}
          unreadByLocation={unreadByLocation}
        />
        <List mode="card">
          {features.mehfilDetails &&
            renderLocationFeature(
              'Mehfil Details',
              'mehfil-details',
              <EnvironmentOutline />,
              WorkspacesPaths.mehfilDetails(selectedId),
            )}
          {features.mehfilPermissions &&
            renderLocationFeature(
              'Mehfil Permissions',
              'mehfil-permissions',
              <CheckShieldOutline />,
              WorkspacesPaths.mehfilPermissions(selectedId),
            )}
          {features.dutiesAttendance && (
            <List.Item
              arrowIcon={expandedId === daId ? <UpOutline /> : <DownOutline />}
              onClick={() => toggle(daId)}
              prefix={
                <span className="workspace-feature-icon workspace-feature-icon-da">
                  <ClockCircleOutline />
                </span>
              }
            >
              Duties &amp; Attendance
            </List.Item>
          )}
          {features.dutiesAttendance &&
            expandedId === daId &&
            DUTIES_ATTENDANCE_PAGES.map(page => (
              <List.Item
                key={page.title}
                className="workspaces-feature-item"
                onClick={() => history.push(page.path(selectedId))}
                prefix={
                  <span className={`workspace-feature-icon workspace-feature-icon-${page.key}`}>
                    {page.icon}
                  </span>
                }
              >
                {page.title}
              </List.Item>
            ))}
          {renderCommittees()}
        </List>
      </PullToRefresh>
    );
  }

  return <Page title="Workspaces">{content}</Page>;
};
