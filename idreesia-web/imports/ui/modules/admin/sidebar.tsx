import React from 'react';
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

interface MenuSelectInfo {
  key: string;
}

const Sidebar = ({ history }: SidebarProps) => {
  const { setActiveSubModuleName } = useActiveModule();

  const handleMenuItemSelected = ({ key }: MenuSelectInfo) => {
    switch (key) {
      case 'users':
        setActiveSubModuleName(SubModuleNames.users);
        history.push(paths.usersPath);
        break;

      case 'user-groups':
        setActiveSubModuleName(SubModuleNames.userGroups);
        history.push(paths.userGroupsPath);
        break;

      case 'physical-stores':
        setActiveSubModuleName(SubModuleNames.physicalStores);
        history.push(paths.physicalStoresPath);
        break;

      case 'cities':
        setActiveSubModuleName(SubModuleNames.cities);
        history.push(paths.citiesPath);
        break;

      case 'people-tags':
        setActiveSubModuleName(SubModuleNames.peopleTags);
        history.push(paths.peopleTagsPath);
        break;

      case 'jobs':
        setActiveSubModuleName(SubModuleNames.jobs);
        history.push(paths.jobsPath);
        break;

      case 'job-logs':
        setActiveSubModuleName(SubModuleNames.jobLogs);
        history.push(paths.jobLogsPath);
        break;

      case 'job-definitions':
        setActiveSubModuleName(SubModuleNames.jobDefinitions);
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
      onClick={handleMenuItemSelected}
      items={menuItems}
    />
  );
};

export default Sidebar;
