import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { flowRight } from "lodash";

import { WithLoggedInUser } from "/imports/ui/composers";

class LoggedInRoute extends Component {
  static propTypes = {
    breadcrumbs: PropTypes.array,
    history: PropTypes.object,
    location: PropTypes.object,

    userByIdLoading: PropTypes.bool,
    userById: PropTypes.object,
  };

  someMethod = () => {}

  render() {
    const { location, history, userByIdLoading, userById } = this.props;

    return <div>Hello from logged in route.</div>;
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
