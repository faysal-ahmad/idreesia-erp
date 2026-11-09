import React, { useMemo, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Badge, List, PullToRefresh } from 'antd-mobile';
import {
  CalendarOutline,
  CheckCircleOutline,
  DownOutline,
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

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/hr';
import { MoonOutline } from '../components/icons/moon-outline';
import { CollapsibleSection } from '../components/collapsible-section';
import { Page, PageError, PageLoading } from '../layout';
import { useHistory } from '../router';
import { WorkspacesPaths } from './paths';
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
  // One feature, two entries: its projects, and its tasks.
  ...(features?.includes(CommitteeFeatureKeys.PROJECTS)
    ? [
        {
          key: 'projects',
          title: 'Projects',
          icon: <UnorderedListOutline />,
          path: WorkspacesPaths.committeeProjects(committeeId),
        },
        {
          key: 'tasks',
          title: 'Tasks',
          icon: <CheckCircleOutline />,
          path: WorkspacesPaths.committeeTasks(committeeId),
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

/** Workspaces tab: the user's workspaces, each expanding to its features. */
export const WorkspacesScreen = () => {
  const history = useHistory();
  // cache-and-network, so a membership added or removed on the web shows up
  // the next time the user comes back to this tab.
  const { data, loading, error, refetch } = useQuery(MOBILE_MY_COMMITTEES, {
    fetchPolicy: 'cache-and-network',
  });
  // Unread notifications: shown on the committee while it is collapsed, and
  // on its module items once it is open. Best effort; the tab works without.
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

  const refresh = () =>
    Promise.all([refetch(), refetchNotifications()]).then(
      () => undefined,
      () => undefined,
    );

  const toggle = (committeeId: string) =>
    setExpandedId(prev => (prev === committeeId ? null : committeeId));

  const committees = (data?.myCommittees ?? []).filter(
    (committee): committee is NonNullable<typeof committee> & { _id: string } =>
      committee?._id != null,
  );

  let content;
  if (loading && !data) {
    content = <PageLoading />;
  } else if (error && !data) {
    content = <PageError error={error} onRetry={refresh} />;
  } else {
    content = (
      <PullToRefresh onRefresh={refresh}>
        <CollapsibleSection count={committees.length} title="My Workspaces">
          {committees.length === 0 ? (
            <List.Item className="workspaces-empty-item">
              You aren&apos;t a member of any workspace yet.
            </List.Item>
          ) : (
            committees.flatMap(committee => {
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
            })
          )}
        </CollapsibleSection>
      </PullToRefresh>
    );
  }

  return <Page title="Workspaces">{content}</Page>;
};
