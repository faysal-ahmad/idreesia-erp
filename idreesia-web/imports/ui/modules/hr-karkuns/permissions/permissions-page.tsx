import React from 'react';
import { type RouteComponentProps } from 'react-router-dom';
import { parse } from 'query-string';
import { Tabs } from 'antd';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';

import PermissionsTab from './permissions-tab';
import UserGroupsTab from './user-groups-tab';

const TABS = [
  { key: 'permissions', label: 'Permissions', children: <PermissionsTab /> },
  { key: 'user-groups', label: 'User Groups', children: <UserGroupsTab /> },
];

/** Who holds the HR - Karkuns permissions, and its user groups. */
const PermissionsPage = ({ history, location }: RouteComponentProps) => {
  useBreadcrumbs(['HR - Karkuns', 'Administration', 'Permissions']);
  const requested = String(parse(location.search).tab ?? '');
  const activeKey = TABS.some((t) => t.key === requested) ? requested : TABS[0].key;

  return (
    <Tabs
      activeKey={activeKey}
      items={TABS}
      destroyOnHidden
      onChange={(key) => history.replace(`${location.pathname}?tab=${key}`)}
    />
  );
};

export default PermissionsPage;
