import React, { Component } from "react";
import PropTypes from "prop-types";

import HeaderContent from './header-content';

export default class LoggedOutRoute extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
  };

  someFunction = () => {}

  render() {
    const { history, location } = this.props;
    return (
      <HeaderContent history={history} location={location} />
    );
  };
}
