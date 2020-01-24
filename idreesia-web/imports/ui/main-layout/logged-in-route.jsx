import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithLoggedInUser } from 'meteor/idreesia-common/composers/common';
import { Layout, Breadcrumb } from './antd-controls';
import HeaderContent from './header-content';
import SidebarContent from './sidebar-content';
import MainContent from './main-content';

class LoggedInRoute extends Component {
  static propTypes = {
    breadcrumbs: PropTypes.array,
    history: PropTypes.object,
    location: PropTypes.object,

    userLoading: PropTypes.bool,
    user: PropTypes.object,
  };

  getBreadcrumbs() {
    let retVal = null;
    const { breadcrumbs } = this.props;
    const breadcrumbItems = [];
    if (breadcrumbs.length > 0) {
      breadcrumbs.forEach((breadcrumb, index) => {
        breadcrumbItems.push(
          <Breadcrumb.Item key={index}>{breadcrumb}</Breadcrumb.Item>
        );
      });

      retVal = (
        <Breadcrumb style={{ margin: '16px 0' }}>{breadcrumbItems}</Breadcrumb>
      );
    }

    return retVal;
  }

  render() {
    const { location, history, userLoading, user } = this.props;

    if (userLoading) return null;

    return (
      <Layout>
        <HeaderContent location={location} history={history} user={user} />
        <Layout>
          <SidebarContent location={location} history={history} />
          <Layout style={{ padding: '0 24px 24px' }}>
            {this.getBreadcrumbs()}
            <MainContent location={location} history={history} />
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = state => ({
  breadcrumbs: state.breadcrumbs,
});

const LoggedInRouteContainer = flowRight(
  WithLoggedInUser(),
  connect(mapStateToProps)
)(LoggedInRoute);

export default LoggedInRouteContainer;
