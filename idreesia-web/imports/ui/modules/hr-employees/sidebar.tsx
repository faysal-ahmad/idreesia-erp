import React, {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import { type History } from 'history';
import {
  AuditOutlined,
  DollarOutlined,
  LaptopOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  TagOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined
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
    key: 'employees',
    icon: <TeamOutlined style={IconStyle} />,
    label: 'Employees',
  },
  {
    key: 'leaves',
    icon: <ScheduleOutlined style={IconStyle} />,
    label: 'Leaves',
  },
  {
    key: 'salary-sheets',
    icon: <DollarOutlined style={IconStyle} />,
    label: 'Salary Sheets',
  },
  {
    key: 'employee-setup',
    icon: <LaptopOutlined style={IconStyle} />,
    label: 'Setup',
    children: [
      {
        key: 'jobs',
        icon: <TagOutlined style={IconStyle} />,
        label: 'Jobs',
      },
      {
        key: 'leave-types',
        icon: <TagsOutlined style={IconStyle} />,
        label: 'Leave Types',
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
    key: 'employees',
    openKeys: [],
    subModuleName: SubModuleNames.employees,
    matches: pathname => isPath(pathname, paths.employeesPath),
  },
  {
    key: 'leaves',
    openKeys: [],
    subModuleName: SubModuleNames.leaves,
    matches: pathname => isPath(pathname, paths.leavesPath),
  },
  {
    key: 'leave-types',
    openKeys: ['employee-setup'],
    subModuleName: SubModuleNames.leaveTypes,
    matches: pathname => isPath(pathname, paths.leaveTypesPath),
  },
  {
    key: 'salary-sheets',
    openKeys: [],
    subModuleName: SubModuleNames.salarySheets,
    matches: pathname => isPath(pathname, paths.salarySheetsPath),
  },
  {
    key: 'jobs',
    openKeys: ['employee-setup'],
    subModuleName: SubModuleNames.jobs,
    matches: pathname => isPath(pathname, paths.jobsPath),
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
      case 'jobs':
        history.push(paths.jobsPath);
        break;

      case 'salary-sheets':
        history.push(paths.salarySheetsPath);
        break;

      case 'employees':
        history.push(paths.employeesPath);
        break;

      case 'leaves':
        history.push(paths.leavesPath);
        break;

      case 'leave-types':
        history.push(paths.leaveTypesPath);
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
