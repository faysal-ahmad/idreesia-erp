import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Layout, Breadcrumb } from 'antd';

import { HeaderContent, SidebarContent, MainContent, LoginForm } from './';

const loginFormWrapperStyle = {
  width: '300px',
  height: '200px',
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginTop: '-100px',
  marginLeft: '-150px',
};

class LoggedInRoute extends Component {
  static propTypes = {
    breadcrumbs: PropTypes.array,
    history: PropTypes.object,
    location: PropTypes.object,
  };

  getBreadcrumbs() {
    let retVal = null;
    const { breadcrumbs } = this.props;
    const breadcrumbItems = [];
    if (breadcrumbs.length > 0) {
      breadcrumbs.forEach((breadcrumb, index) => {
        breadcrumbItems.push(<Breadcrumb.Item key={index}>{breadcrumb}</Breadcrumb.Item>);
      });

      retVal = <Breadcrumb style={{ margin: '16px 0' }}>{breadcrumbItems}</Breadcrumb>;
    }

    return retVal;
  }

  render() {
    const { location, history } = this.props;
    const userId = Meteor.userId();

    if (userId) {
      return (
        <Layout>
          <HeaderContent location={location} history={history} />
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
    return (
      <div style={loginFormWrapperStyle}>
        <LoginForm location={location} history={history} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  breadcrumbs: state.breadcrumbs,
});

const LoggedInRouteContainer = connect(mapStateToProps)(LoggedInRoute);
export default LoggedInRouteContainer;
