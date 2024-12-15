import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Layout, Breadcrumb } from 'antd';

import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';
import HeaderContent from './header-content';
import SidebarContent from './sidebar-content';
import MainContent from './main-content';

const LoggedInRoute = ({ location, history }) => {
  const breadcrumbs = useSelector(state => state.breadcrumbs);
  const { user, userLoading } = useLoggedInUser();
  if (userLoading) return null;

  const getBreadcrumbs = () => {
    let retVal = null;
    const breadcrumbItems = [];
    if (breadcrumbs.length > 0) {
      breadcrumbs.forEach(breadcrumb => {
        breadcrumbItems.push({title: breadcrumb});
      });

      retVal = (
        <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />
      );
    }

    return retVal;
  };

  return (
    <Layout>
      <HeaderContent location={location} history={history} user={user} />
      <Layout>
        <SidebarContent location={location} history={history} />
        <Layout style={{ padding: '0 24px 24px' }}>
          {getBreadcrumbs()}
          <MainContent location={location} history={history} />
        </Layout>
      </Layout>
    </Layout>
  );
};

LoggedInRoute.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default LoggedInRoute;
