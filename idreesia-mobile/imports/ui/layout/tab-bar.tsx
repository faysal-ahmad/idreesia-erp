import React from 'react';
import { TabBar } from 'antd-mobile';
import { AppstoreOutline, UserOutline } from 'antd-mobile-icons';

import { useHistory } from '../router';

/** Top-level destinations. Only their root screens show the tab bar. */
export const tabs = [
  { key: '/', title: 'Modules', icon: <AppstoreOutline /> },
  { key: '/account', title: 'Account', icon: <UserOutline /> },
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
