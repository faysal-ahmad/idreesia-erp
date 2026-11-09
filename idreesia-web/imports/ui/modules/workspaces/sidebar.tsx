import React, { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { type History } from 'history';
import { Menu } from 'antd';
import {
  AlertOutlined,
  BarChartOutlined,
  CalendarOutlined,
  ClusterOutlined,
  FolderOpenOutlined,
  IdcardOutlined,
  MessageOutlined,
  MoonOutlined,
  ProjectOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/hr';
import { useActiveModule } from 'meteor/idreesia-common/hooks/common';
import { useMyCommittees } from './hooks/use-my-committees';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const IconStyle: CSSProperties = {
  fontSize: '20px',
};

interface SidebarProps {
  history: History;
}

type PathBuilder = (committeeId?: string) => string;
type KeyPrefixHandler = [string, string, PathBuilder];

// [menu key prefix, sub-module name, path builder] for each committee
// sub-module. Menu keys are `${prefix}-${committeeId}`.
const KeyPrefixHandlers: KeyPrefixHandler[] = [
  ['members', SubModuleNames.members, paths.committeeMembersPath],
  ['discussions', SubModuleNames.discussions, paths.committeeDiscussionsPath],
  ['documents', SubModuleNames.documents, paths.committeeDocumentsPath],
  ['meetings', SubModuleNames.meetings, paths.committeeMeetingsPath],
  ['polls', SubModuleNames.polls, paths.committeePollsPath],
  ['projects', SubModuleNames.projects, paths.committeeProjectsPath],
  [
    'night-stay-report',
    SubModuleNames.nightStayReport,
    paths.committeeNightStayReportPath,
  ],
  [
    'monitoring-alerts',
    SubModuleNames.monitoringAlerts,
    paths.committeeMonitoringAlertsPath,
  ],
  [
    'monitoring-profiles',
    SubModuleNames.monitoringProfiles,
    paths.committeeMonitoringProfilesPath,
  ],
];

interface ActiveMenu {
  committeeId: string;
  key: string;
  subModuleName: string;
}

const COMMITTEE_PATH_REGEX = new RegExp(
  `^${paths.committeePath('([^/]+)')}/([^/]+)`
);

const resolveMenuFromPath = (pathname: string): ActiveMenu | null => {
  const match = COMMITTEE_PATH_REGEX.exec(pathname);
  if (!match) return null;
  const [, committeeId, prefix] = match;
  const handler = KeyPrefixHandlers.find(([p]) => p === prefix);
  if (!handler) return null;
  return {
    committeeId,
    key: `${prefix}-${committeeId}`,
    subModuleName: handler[1],
  };
};

const sameKeySet = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((key) => setB.has(key));
};

// Lists the committees the user is a member of, each with its sub-modules.
const Sidebar = ({ history }: SidebarProps) => {
  const { activeSubModuleName, setActiveSubModuleName } = useActiveModule();
  const { committees, loading } = useMyCommittees();
  const [pathname, setPathname] = useState(history.location.pathname);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    const unlisten = history.listen((location) => {
      setPathname(location.pathname);
    });
    return unlisten;
  }, [history]);

  const activeMenu = useMemo(() => resolveMenuFromPath(pathname), [pathname]);

  useEffect(() => {
    if (!activeMenu) return;

    if (activeSubModuleName !== activeMenu.subModuleName) {
      setActiveSubModuleName(activeMenu.subModuleName);
    }

    setOpenKeys((prev) => {
      const merged = Array.from(new Set([...prev, activeMenu.committeeId]));
      return sameKeySet(prev, merged) ? prev : merged;
    });
  }, [activeMenu, activeSubModuleName, setActiveSubModuleName]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys((prev) => (sameKeySet(prev, keys) ? prev : keys));
  };

  const handleMenuItemSelected = ({ key }: { key: string }) => {
    const handler = KeyPrefixHandlers.find(([prefix]) =>
      key.startsWith(`${prefix}-`)
    );
    if (!handler) return;

    const [prefix, subModuleName, getPath] = handler;
    const committeeId = key.slice(prefix.length + 1);
    setActiveSubModuleName(subModuleName);
    history.push(getPath(committeeId));
  };

  if (loading) return null;

  const menuItems = committees.map((committee) => ({
    key: committee._id!,
    icon: <ClusterOutlined style={IconStyle} />,
    label: committee.name,
    children: [
      // Each item only for committees with that feature enabled.
      ...(committee.features?.includes(CommitteeFeatureKeys.MEMBERS)
        ? [
            {
              key: `members-${committee._id}`,
              icon: <TeamOutlined style={IconStyle} />,
              label: 'Members',
            },
          ]
        : []),
      ...(committee.features?.includes(CommitteeFeatureKeys.DISCUSSIONS)
        ? [
            {
              key: `discussions-${committee._id}`,
              icon: <MessageOutlined style={IconStyle} />,
              label: 'Discussions',
            },
          ]
        : []),
      ...(committee.features?.includes(CommitteeFeatureKeys.DOCUMENTS)
        ? [
            {
              key: `documents-${committee._id}`,
              icon: <FolderOpenOutlined style={IconStyle} />,
              label: 'Documents',
            },
          ]
        : []),
      ...(committee.features?.includes(CommitteeFeatureKeys.MEETINGS)
        ? [
            {
              key: `meetings-${committee._id}`,
              icon: <CalendarOutlined style={IconStyle} />,
              label: 'Meetings',
            },
          ]
        : []),
      ...(committee.features?.includes(CommitteeFeatureKeys.POLLS)
        ? [
            {
              key: `polls-${committee._id}`,
              icon: <BarChartOutlined style={IconStyle} />,
              label: 'Polls',
            },
          ]
        : []),
      ...(committee.features?.includes(CommitteeFeatureKeys.PROJECTS)
        ? [
            {
              key: `projects-${committee._id}`,
              icon: <ProjectOutlined style={IconStyle} />,
              label: 'Projects & Tasks',
            },
          ]
        : []),
      ...(committee.features?.includes(CommitteeFeatureKeys.NIGHT_STAY_REPORT)
        ? [
            {
              key: `night-stay-report-${committee._id}`,
              icon: <MoonOutlined style={IconStyle} />,
              label: 'Night Stay Report',
            },
          ]
        : []),
      ...(committee.features?.includes(
        CommitteeFeatureKeys.MONITORING_ALERTS
      )
        ? [
            {
              key: `monitoring-alerts-${committee._id}`,
              icon: <AlertOutlined style={IconStyle} />,
              label: 'Monitoring Alerts',
            },
          ]
        : []),
      ...(committee.features?.includes(
        CommitteeFeatureKeys.MONITORING_PROFILES
      )
        ? [
            {
              key: `monitoring-profiles-${committee._id}`,
              icon: <IdcardOutlined style={IconStyle} />,
              label: 'Monitoring Profiles',
            },
          ]
        : []),
    ],
  }));

  return (
    <Menu
      mode="inline"
      style={{ height: '100%', borderRight: 0 }}
      selectedKeys={activeMenu ? [activeMenu.key] : []}
      openKeys={openKeys}
      onOpenChange={handleOpenChange}
      onClick={handleMenuItemSelected}
      items={menuItems}
    />
  );
};

export default Sidebar;
