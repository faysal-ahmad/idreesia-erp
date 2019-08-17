import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Layout, Breadcrumb } from "antd";
import { compose } from "react-apollo";

import { WithLoggedInUser } from "/imports/ui/composers";
import { HeaderContent, SidebarContent, MainContent } from "./";

class LoggedInRoute extends Component {
  static propTypes = {
    breadcrumbs: PropTypes.array,
    history: PropTypes.object,
    location: PropTypes.object,

    userByIdLoading: PropTypes.bool,
    userById: PropTypes.object,
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
        <Breadcrumb style={{ margin: "16px 0" }}>{breadcrumbItems}</Breadcrumb>
      );
    }

    return retVal;
  }

  render() {
    const { location, history, userByIdLoading, userById } = this.props;

    if (userByIdLoading) return null;

    return (
      <Layout>
        <HeaderContent
          location={location}
          history={history}
          userById={userById}
        />
        <Layout>
          <SidebarContent location={location} history={history} />
          <Layout style={{ padding: "0 24px 24px" }}>
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

const LoggedInRouteContainer = compose(
  WithLoggedInUser(),
  connect(mapStateToProps)
)(LoggedInRoute);

export default LoggedInRouteContainer;
