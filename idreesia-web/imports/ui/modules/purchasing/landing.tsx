import React from 'react';
import { Empty, Spin } from 'antd';
import { Redirect } from 'react-router-dom';

import usePurchasingAccess from './common/use-purchasing-access';
import menuEntries from './menu-entries';

/** The module's start page: the first section the user is allowed to open. */
const Landing = () => {
  const { can, userLoading } = usePurchasingAccess();

  if (userLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const first = menuEntries.find((entry) => can(...entry.permissions));
  if (!first) {
    return <Empty description="You have no access to any Purchasing section." style={{ padding: '80px 0' }} />;
  }
  return <Redirect to={first.basePath} />;
};

export default Landing;
