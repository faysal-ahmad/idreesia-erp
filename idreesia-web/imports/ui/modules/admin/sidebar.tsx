import React, { useEffect, useMemo, useState } from 'react';
import { type History } from 'history';

import { useActiveModule } from 'meteor/idreesia-common/hooks/common';
import { Menu } from 'antd';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const menuItems = [
  {
    key: 'access',
    label: 'Access Management',
    children: [
      { key: 'users', label: 'Users' },
      { key: 'user-groups', label: 'User Groups' },
    ],
  },
  {
    key: 'instances',
    label: 'Instance Management',
    children: [{ key: 'physical-stores', label: 'Physical Stores' }],
  },
  {
    key: 'locations',
    label: 'Reference Data',
    children: [
      { key: 'cities', label: 'Cities & Mehfils' },
      { key: 'people-tags', label: 'People Tags' },
    ],
  },
  {
    key: 'deleted-data',
    label: 'Deleted Data',
    children: [{ key: 'deleted-people', label: 'People' }],
  },
  {
    key: 'monitoring',
    label: 'Scheduled Jobs',
    children: [
      { key: 'job-definitions', label: 'Job Definitions' },
      { key: 'jobs', label: 'Jobs Dashboard' },
      { key: 'job-logs', label: 'Job Logs' },
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
    key: 'users',
    openKeys: ['access'],
    subModuleName: SubModuleNames.users,
    matches: (pathname) => isPath(pathname, paths.usersPath),
  },
  {
    key: 'user-groups',
    openKeys: ['access'],
    subModuleName: SubModuleNames.userGroups,
    matches: (pathname) => isPath(pathname, paths.userGroupsPath),
  },
  {
    key: 'physical-stores',
    openKeys: ['instances'],
    subModuleName: SubModuleNames.physicalStores,
    matches: (pathname) => isPath(pathname, paths.physicalStoresPath),
  },
  {
    key: 'cities',
    openKeys: ['locations'],
    subModuleName: SubModuleNames.cities,
    matches: (pathname) => isPath(pathname, paths.citiesPath),
  },
  {
    key: 'people-tags',
    openKeys: ['locations'],
    subModuleName: SubModuleNames.peopleTags,
    matches: (pathname) => isPath(pathname, paths.peopleTagsPath),
  },
  {
    key: 'deleted-people',
    openKeys: ['deleted-data'],
    subModuleName: SubModuleNames.deletedPeople,
    matches: (pathname) => isPath(pathname, paths.deletedPeoplePath),
  },
  {
    key: 'jobs',
    openKeys: ['monitoring'],
    subModuleName: SubModuleNames.jobs,
    matches: (pathname) => isPath(pathname, paths.jobsPath),
  },
  {
    key: 'job-logs',
    openKeys: ['monitoring'],
    subModuleName: SubModuleNames.jobLogs,
    matches: (pathname) => isPath(pathname, paths.jobLogsPath),
  },
  {
    key: 'job-definitions',
    openKeys: ['monitoring'],
    subModuleName: SubModuleNames.jobDefinitions,
    matches: (pathname) => isPath(pathname, paths.jobDefinitionsPath),
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
      case 'users':
        history.push(paths.usersPath);
        break;

      case 'user-groups':
        history.push(paths.userGroupsPath);
        break;

      case 'physical-stores':
        history.push(paths.physicalStoresPath);
        break;

      case 'cities':
        history.push(paths.citiesPath);
        break;

      case 'people-tags':
        history.push(paths.peopleTagsPath);
        break;

      case 'deleted-people':
        history.push(paths.deletedPeoplePath);
        break;

      case 'jobs':
        history.push(paths.jobsPath);
        break;

      case 'job-logs':
        history.push(paths.jobLogsPath);
        break;

      case 'job-definitions':
        history.push(paths.jobDefinitionsPath);
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
