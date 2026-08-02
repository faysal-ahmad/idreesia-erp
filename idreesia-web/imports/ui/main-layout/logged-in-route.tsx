import React from 'react';
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
    <Layout>
      <HeaderContent location={location} history={history} user={user} />
      <Layout>
        <SidebarContent history={history} />
        <Layout style={{ padding: '0 24px 24px' }}>
          {getBreadcrumbs()}
          <MainContent />
        </Layout>
      </Layout>
    </Layout>
  );
};
