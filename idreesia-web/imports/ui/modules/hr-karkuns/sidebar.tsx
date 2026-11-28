import React, {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import { type History } from 'history';
import {
  AuditOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  LaptopOutlined,
  SafetyCertificateOutlined,
  SolutionOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  UsergroupAddOutlined
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
    key: 'karkuns',
    icon: <TeamOutlined style={IconStyle} />,
    label: 'Karkuns',
  },
  {
    key: 'duty-planning',
    icon: <CalendarOutlined style={IconStyle} />,
    label: 'Duty Planning',
  },
  {
    key: 'duty-attendance',
    icon: <CheckCircleOutlined style={IconStyle} />,
    label: 'Duty Attendance',
  },
  {
    key: 'attendance-report',
    icon: <SolutionOutlined style={IconStyle} />,
    label: 'Attendance Report',
  },
  {
    key: 'setup',
    icon: <LaptopOutlined style={IconStyle} />,
    label: 'Setup',
    children: [
      {
        key: 'ms-duties',
        icon: <TagsOutlined style={IconStyle} />,
        label: 'Duties & Shifts',
      },
      {
        key: 'teams',
        icon: <UsergroupAddOutlined style={IconStyle} />,
        label: 'Teams',
      },
    ],
  },
  {
    key: 'administration',
    icon: <ToolOutlined style={IconStyle} />,
    label: 'Administration',
    children: [
      {
        key: 'audit-logs',
        icon: <AuditOutlined style={IconStyle} />,
        label: 'Audit Logs',
      },
      {
        key: 'permissions',
        icon: <SafetyCertificateOutlined style={IconStyle} />,
        label: 'Permissions',
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
    key: 'karkuns',
    openKeys: [],
    subModuleName: SubModuleNames.karkuns,
    matches: pathname => isPath(pathname, paths.karkunsPath),
  },
  {
    key: 'attendance-report',
    openKeys: [],
    subModuleName: SubModuleNames.attendanceReport,
    matches: pathname => isPath(pathname, paths.attendanceReportPath),
  },
  {
    key: 'duty-planning',
    openKeys: [],
    subModuleName: SubModuleNames.dutyPlanning,
    matches: pathname => isPath(pathname, paths.dutyPlanningPath),
  },
  {
    key: 'duty-attendance',
    openKeys: [],
    subModuleName: SubModuleNames.dutyAttendance,
    matches: pathname => isPath(pathname, paths.dutyAttendancePath),
  },
  {
    key: 'ms-duties',
    openKeys: ['setup'],
    subModuleName: SubModuleNames.msDuties,
    matches: pathname => isPath(pathname, paths.msDutiesPath),
  },
  {
    key: 'teams',
    openKeys: ['setup'],
    subModuleName: SubModuleNames.teams,
    matches: pathname => isPath(pathname, paths.teamsPath),
  },
  {
    key: 'audit-logs',
    openKeys: ['administration'],
    subModuleName: SubModuleNames.auditLogs,
    matches: pathname => isPath(pathname, paths.auditLogsPath),
  },
  {
    key: 'permissions',
    openKeys: ['administration'],
    subModuleName: SubModuleNames.permissions,
    matches: pathname => isPath(pathname, paths.permissionsPath),
  },
];

const resolveMenuFromPath = (pathname: string): MenuRouteMatch | null =>
  menuRouteMatches.find(entry => entry.matches(pathname)) ?? null;

const sameKeySet = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every(key => setB.has(key));
};

const Sidebar = ({ history }: SidebarProps) => {
  const { activeSubModuleName, setActiveSubModuleName } = useActiveModule();
  const [pathname, setPathname] = useState(history.location.pathname);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    const unlisten = history.listen(location => {
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

    setOpenKeys(prev => {
      const merged = Array.from(new Set([...prev, ...activeMenu.openKeys]));
      return sameKeySet(prev, merged) ? prev : merged;
    });
  }, [activeMenu, activeSubModuleName, setActiveSubModuleName]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(prev => (sameKeySet(prev, keys) ? prev : keys));
  };

  const handleMenuItemSelected = ({ key }: MenuClickInfo) => {
    switch (key) {
      case 'ms-duties':
        history.push(paths.msDutiesPath);
        break;

      case 'attendance-report':
        history.push(paths.attendanceReportPath);
        break;

      case 'duty-planning':
        history.push(paths.dutyPlanningPath);
        break;

      case 'duty-attendance':
        history.push(paths.dutyAttendancePath);
        break;

      case 'teams':
        history.push(paths.teamsPath);
        break;

      case 'karkuns':
        history.push(paths.karkunsPath);
        break;

      case 'audit-logs':
        history.push(paths.auditLogsPath);
        break;

      case 'permissions':
        history.push(paths.permissionsPath);
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
