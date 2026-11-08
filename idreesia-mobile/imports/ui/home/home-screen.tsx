import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { List, PullToRefresh } from 'antd-mobile';
import {
  DownOutline,
  ExclamationShieldOutline,
  FolderOutline,
  MessageOutline,
  TeamOutline,
  UpOutline,
  UserContactOutline,
} from 'antd-mobile-icons';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/hr';
import { MoonOutline } from '../components/icons/moon-outline';
import { Page, PageError, PageLoading } from '../layout';
import { useHistory } from '../router';
import { WorkspacesPaths } from '../workspaces/paths';
import { MOBILE_MY_COMMITTEES } from './gql';

// What each workspace offers, as in the web's Workspaces sidebar: Members
// always, the other features only when the committee has that
// feature enabled.
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
  {
    key: 'members',
    title: 'Members',
    icon: <TeamOutline />,
    path: WorkspacesPaths.committeeMembers(committeeId),
  },
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

/** Home tab, the default screen after signing in. */
export const HomeScreen = () => {
  const history = useHistory();
  // cache-and-network, so a membership added or removed on the web shows up
  // the next time the user comes back to Home.
  const { data, loading, error, refetch } = useQuery(MOBILE_MY_COMMITTEES, {
    fetchPolicy: 'cache-and-network',
  });
  // One workspace open at a time; opening another closes the previous one.
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = () => refetch().then(
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
        <List header="My Workspaces" mode="card">
          {committees.length === 0 ? (
            <List.Item className="home-empty-item">
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
                  onClick={() => toggle(committee._id)}
                >
                  {committee.name}
                </List.Item>,
                ...(expanded
                  ? getWorkspaceItems(committee._id, committee.features).map(item => (
                      <List.Item
                        key={`${committee._id}-${item.key}`}
                        className="home-workspace-item"
                        onClick={() => history.push(item.path)}
                        prefix={<span className="list-icon">{item.icon}</span>}
                      >
                        {item.title}
                      </List.Item>
                    ))
                  : []),
              ];
            })
          )}
        </List>
      </PullToRefresh>
    );
  }

  return <Page title="Home">{content}</Page>;
};
