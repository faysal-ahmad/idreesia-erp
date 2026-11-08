import React from 'react';
import { TabBar } from 'antd-mobile';
import { AppstoreOutline, FolderOutline, UserOutline } from 'antd-mobile-icons';

import { AccountPaths } from '../account/paths';
import { HomeOutline } from '../components/icons/home-outline';
import { HomePaths } from '../home/paths';
import { AppsPaths } from '../apps/paths';
import { useHistory } from '../router';
import { WorkspacesPaths } from '../workspaces/paths';

/** Top-level destinations. Only their root screens show the tab bar. */
export const tabs = [
  { key: HomePaths.home, title: 'Home', icon: <HomeOutline /> },
  { key: WorkspacesPaths.root, title: 'Workspaces', icon: <FolderOutline /> },
  { key: AppsPaths.apps, title: 'Apps', icon: <AppstoreOutline /> },
  { key: AccountPaths.account, title: 'Account', icon: <UserOutline /> },
];

export const isTabRoot = (pathname: string) => tabs.some(tab => tab.key === pathname);

export const AppTabBar = ({ pathname }: { pathname: string }) => {
  const history = useHistory();
  return (
    <TabBar
      activeKey={pathname}
      className="app-tab-bar"
      safeArea
      onChange={key => history.replace(key)}
    >
      {tabs.map(tab => (
        <TabBar.Item key={tab.key} icon={tab.icon} title={tab.title} />
      ))}
    </TabBar>
  );
};
