import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout, Breadcrumb } from 'antd';

const { Content } = Layout;

import { HeaderContent, SidebarContent, MainContent } from './';

class LoggedInRoute extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object
  };

  render() {
    const { location, history } = this.props;

    /* 
      <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>List</Breadcrumb.Item>
        <Breadcrumb.Item>App</Breadcrumb.Item>
      </Breadcrumb>
    */
    return (
      <Layout>
        <HeaderContent location={location} history={history} />
        <Layout>
          <SidebarContent location={location} history={history} />
          <Layout style={{ padding: '0 24px 24px' }}>
            <MainContent location={location} history={history} />
          </Layout>
        </Layout>
      </Layout>
    );
  }
}

export default LoggedInRoute;
