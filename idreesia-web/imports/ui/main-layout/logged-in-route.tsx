import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Layout, Breadcrumb } from 'antd';

import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';
import HeaderContent from './header-content';
import SidebarContent from './sidebar-content';
import MainContent from './main-content';

const AntLayout = Layout as any;
const AntBreadcrumb = Breadcrumb as any;
const Header = HeaderContent as any;
const Sidebar = SidebarContent as any;
const Main = MainContent as any;
type AnyRecord = Record<string, any>;
interface Props { location: AnyRecord; history: AnyRecord; }

export const LoggedInRoute = ({ location, history }: Props) => {
  const breadcrumbs = useSelector((state: AnyRecord) => state.breadcrumbs ?? []);
  const { user, userLoading } = useLoggedInUser();
  if (userLoading) return null;

  const getBreadcrumbs = () => {
    let retVal = null;
    const breadcrumbItems: any[] = [];
    if (breadcrumbs.length > 0) {
      breadcrumbs.forEach((breadcrumb: string) => {
        breadcrumbItems.push({title: breadcrumb});
      });

      retVal = (
        <AntBreadcrumb style={{ margin: '16px 0' }} items={breadcrumbItems} />
      );
    }

    return retVal;
  };

  return (
    <AntLayout>
      <Header location={location} history={history} user={user} />
      <AntLayout>
        <Sidebar location={location} history={history} />
        <AntLayout style={{ padding: '0 24px 24px' }}>
          {getBreadcrumbs()}
          <Main location={location} history={history} />
        </AntLayout>
      </AntLayout>
    </AntLayout>
  );
};

LoggedInRoute.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};