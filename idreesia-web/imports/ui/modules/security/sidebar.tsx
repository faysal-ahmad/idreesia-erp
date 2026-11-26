import React, { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { type History } from 'history';
import {
  AlertOutlined,
  AuditOutlined,
  BarcodeOutlined,
  BarsOutlined,
  BookOutlined,
  DashboardOutlined,
  FlagOutlined,
  IdcardOutlined,
  LaptopOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  UnorderedListOutlined,
  UserOutlined,
  VideoCameraOutlined,
  WarningOutlined,
} from '@ant-design/icons';

import { useActiveModule } from 'meteor/idreesia-common/hooks/common';
import { Menu } from 'antd';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const IconStyle: CSSProperties = {
  fontSize: '20px',
};

const menuItems = [
  {
    key: 'event-management',
    icon: <FlagOutlined style={IconStyle} />,
    label: 'Event Management',
    children: [
      {
        key: 'events',
        icon: <BarsOutlined style={IconStyle} />,
        label: 'Events',
      },
      {
        key: 'event-card-verification',
        icon: <BarcodeOutlined style={IconStyle} />,
        label: 'Scan Karkun Card',
      },
      {
        key: 'setup',
        icon: <LaptopOutlined style={IconStyle} />,
        label: 'Setup',
        children: [
          {
            key: 'event-duties',
            icon: <TagsOutlined style={IconStyle} />,
            label: 'Event Duties',
          },
          {
            key: 'event-langar-dishes',
            icon: <TagsOutlined style={IconStyle} />,
            label: 'Langar Dishes',
          },
          {
            key: 'event-langar-locations',
            icon: <TagsOutlined style={IconStyle} />,
            label: 'Langar Locations',
          },
        ],
      },
    ],
  },
  {
    key: 'visitors',
    icon: <TeamOutlined style={IconStyle} />,
    label: 'Visitors',
    children: [
      {
        key: 'visitor-registration',
        icon: <IdcardOutlined style={IconStyle} />,
        label: 'Registration',
      },
      {
        key: 'visitor-list',
        icon: <UnorderedListOutlined style={IconStyle} />,
        label: 'Visitor List',
      },
      {
        key: 'visitor-card-verification',
        icon: <BarcodeOutlined style={IconStyle} />,
        label: 'Card Verification',
      },
      {
        key: 'visitor-stay-report',
        icon: <BookOutlined style={IconStyle} />,
        label: 'Visitor Stay Report',
      },
    ],
  },
  {
    key: 'security-server',
    icon: <AlertOutlined style={IconStyle} />,
    label: 'Security Server',
    children: [
      {
        key: 'security-server-alerts',
        icon: <WarningOutlined style={IconStyle} />,
        label: 'Alerts',
      },
      {
        key: 'security-server-profiles',
        icon: <UserOutlined style={IconStyle} />,
        label: 'Profiles',
      },
      {
        key: 'security-server-channels',
        icon: <VideoCameraOutlined style={IconStyle} />,
        label: 'Channels',
      },
      {
        key: 'security-server-usage',
        icon: <DashboardOutlined style={IconStyle} />,
        label: 'Usage',
      },
    ],
  },
  {
    key: 'administration',
    icon: <ToolOutlined style={IconStyle} />,
    label: 'Administration',
    children: [
      {
        key: 'permissions',
        icon: <SafetyCertificateOutlined style={IconStyle} />,
        label: 'Permissions',
      },
      {
        key: 'audit-logs',
        icon: <AuditOutlined style={IconStyle} />,
        label: 'Audit Logs',
      },
    ],
  },
];

interface SidebarProps {
  history: History;
}

interface MenuClickInfo {
  key: string;
}

interface MenuRouteMatch {
  key: string;
  openKeys: string[];
  subModuleName: string;
  matches: (pathname: string) => boolean;
}

const isPath = (pathname: string, basePath: string) =>
  pathname === basePath || pathname.startsWith(`${basePath}/`);

const menuRouteMatches: MenuRouteMatch[] = [
  {
    key: 'events',
    openKeys: ['event-management'],
    subModuleName: SubModuleNames.events,
    matches: (pathname) => isPath(pathname, paths.eventsPath),
  },
  {
    key: 'event-card-verification',
    openKeys: ['event-management'],
    subModuleName: SubModuleNames.eventCardVerification,
    matches: (pathname) => isPath(pathname, paths.eventCardVerificationPath),
  },
  {
    key: 'visitor-list',
    openKeys: ['visitors'],
    subModuleName: SubModuleNames.visitorList,
    matches: (pathname) =>
      isPath(pathname, paths.visitorRegistrationListPath) ||
      pathname === paths.visitorRegistrationNewFormPath ||
      pathname === paths.visitorRegistrationUploadFormPath ||
      (pathname.startsWith(`${paths.visitorRegistrationPath}/`) &&
        !isPath(pathname, paths.visitorRegistrationListPath)),
  },
  {
    key: 'visitor-registration',
    openKeys: ['visitors'],
    subModuleName: SubModuleNames.visitorRegistration,
    matches: (pathname) => pathname === paths.visitorRegistrationPath,
  },
  {
    key: 'visitor-card-verification',
    openKeys: ['visitors'],
    subModuleName: SubModuleNames.visitorCardVerification,
    matches: (pathname) => isPath(pathname, paths.visitorCardVerificationPath),
  },
  {
    key: 'visitor-stay-report',
    openKeys: ['visitors'],
    subModuleName: SubModuleNames.visitorStayReport,
    matches: (pathname) => isPath(pathname, paths.visitorStayReportPath),
  },
  {
    key: 'event-duties',
    openKeys: ['event-management', 'setup'],
    subModuleName: SubModuleNames.eventDuties,
    matches: (pathname) => isPath(pathname, paths.eventDutiesPath),
  },
  {
    key: 'event-langar-dishes',
    openKeys: ['event-management', 'setup'],
    subModuleName: SubModuleNames.eventLangarDishes,
    matches: (pathname) => isPath(pathname, paths.eventLangarDishesPath),
  },
  {
    key: 'event-langar-locations',
    openKeys: ['event-management', 'setup'],
    subModuleName: SubModuleNames.eventLangarLocations,
    matches: (pathname) => isPath(pathname, paths.eventLangarLocationsPath),
  },
  {
    key: 'security-server-alerts',
    openKeys: ['security-server'],
    subModuleName: SubModuleNames.securityServerAlerts,
    matches: (pathname) => isPath(pathname, paths.securityServerAlertsPath),
  },
  {
    key: 'security-server-profiles',
    openKeys: ['security-server'],
    subModuleName: SubModuleNames.securityServerProfiles,
    matches: (pathname) => isPath(pathname, paths.securityServerProfilesPath),
  },
  {
    key: 'security-server-channels',
    openKeys: ['security-server'],
    subModuleName: SubModuleNames.securityServerChannels,
    matches: (pathname) => isPath(pathname, paths.securityServerChannelsPath),
  },
  {
    key: 'security-server-usage',
    openKeys: ['security-server'],
    subModuleName: SubModuleNames.securityServerUsage,
    matches: (pathname) => isPath(pathname, paths.securityServerUsagePath),
  },
  {
    key: 'permissions',
    openKeys: ['administration'],
    subModuleName: SubModuleNames.permissions,
    matches: (pathname) => isPath(pathname, paths.permissionsPath),
  },
  {
    key: 'audit-logs',
    openKeys: ['administration'],
    subModuleName: SubModuleNames.auditLogs,
    matches: (pathname) => isPath(pathname, paths.auditLogsPath),
  },
];

const resolveMenuFromPath = (pathname: string): MenuRouteMatch | null =>
  menuRouteMatches.find((entry) => entry.matches(pathname)) ?? null;

const sameKeySet = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((key) => setB.has(key));
};

const Sidebar = ({ history }: SidebarProps) => {
  const { activeSubModuleName, setActiveSubModuleName } = useActiveModule();
  const [pathname, setPathname] = useState(history.location.pathname);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    const unlisten = history.listen((location) => {
      setPathname(location.pathname);
    });
    return unlisten;
  }, [history]);

  const activeMenu = useMemo(
    () => resolveMenuFromPath(pathname),
    [pathname]
  );

  useEffect(() => {
    if (!activeMenu) return;

    if (activeSubModuleName !== activeMenu.subModuleName) {
      setActiveSubModuleName(activeMenu.subModuleName);
    }

    setOpenKeys((prev) => {
      const merged = Array.from(new Set([...prev, ...activeMenu.openKeys]));
      return sameKeySet(prev, merged) ? prev : merged;
    });
  }, [activeMenu, activeSubModuleName, setActiveSubModuleName]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys((prev) => (sameKeySet(prev, keys) ? prev : keys));
  };

  const handleMenuItemSelected = ({ key }: MenuClickInfo) => {
    switch (key) {
      case 'events':
        history.push(paths.eventsPath);
        break;

      case 'event-duties':
        history.push(paths.eventDutiesPath);
        break;

      case 'event-langar-dishes':
        history.push(paths.eventLangarDishesPath);
        break;

      case 'event-langar-locations':
        history.push(paths.eventLangarLocationsPath);
        break;

      case 'event-card-verification':
        history.push(paths.eventCardVerificationPath);
        break;

      case 'visitor-registration':
        history.push(paths.visitorRegistrationPath);
        break;

      case 'visitor-list':
        history.push(paths.visitorRegistrationListPath);
        break;

      case 'visitor-card-verification':
        history.push(paths.visitorCardVerificationPath);
        break;

      case 'security-server-alerts':
        history.push(paths.securityServerAlertsPath);
        break;

      case 'security-server-profiles':
        history.push(paths.securityServerProfilesPath);
        break;

      case 'security-server-channels':
        history.push(paths.securityServerChannelsPath);
        break;

      case 'security-server-usage':
        history.push(paths.securityServerUsagePath);
        break;

      case 'permissions':
        history.push(paths.permissionsPath);
        break;

      case 'audit-logs':
        history.push(paths.auditLogsPath);
        break;

      case 'visitor-stay-report':
        history.push(paths.visitorStayReportPath);
        break;

      default:
        break;
    }
  };

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
