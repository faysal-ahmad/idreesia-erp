import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Layout, Breadcrumb } from 'antd';
import type { BreadcrumbProps } from 'antd';
import { type RouteComponentProps } from 'react-router';

import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';
import HeaderContent from './header-content';
import SidebarContent from './sidebar-content';
import MainContent from './main-content';

interface LayoutRootState {
  breadcrumbs?: unknown[];
}

type Props = RouteComponentProps;

export const LoggedInRoute = ({ location, history }: Props) => {
  const breadcrumbs = useSelector(
    (state: LayoutRootState) => state.breadcrumbs ?? []
  );
  const { user, userLoading } = useLoggedInUser();

  useEffect(() => {
    const { pathname, search, hash } = location;
    if (pathname === '/inventory' || pathname.startsWith('/inventory/')) {
      history.replace(`/stores${pathname.slice('/inventory'.length)}${search}${hash}`);
    }
  }, [history, location]);

  if (userLoading) return null;

  const getBreadcrumbs = () => {
    let retVal = null;
    const breadcrumbItems: BreadcrumbProps['items'] = [];
    if (breadcrumbs.length > 0) {
      breadcrumbs.forEach((breadcrumb) => {
        breadcrumbItems.push({ title: String(breadcrumb) });
      });

      retVal = (
        <Breadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />
      );
    }

    return retVal;
  };

  return (
    <Layout className="app-shell">
      <HeaderContent location={location} history={history} user={user} />
      <Layout className="app-shell-body">
        <SidebarContent history={history} />
        <Layout className="app-shell-content" style={{ padding: '0 24px 24px' }}>
          {getBreadcrumbs()}
          <MainContent />
        </Layout>
      </Layout>
    </Layout>
  );
};
