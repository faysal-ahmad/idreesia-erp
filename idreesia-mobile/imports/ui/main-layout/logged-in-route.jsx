import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { flowRight } from 'lodash';

import {
  WithActiveModule,
  WithLoggedInUser,
} from 'meteor/idreesia-common/composers/common';

class LoggedInRoute extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,

    userByIdLoading: PropTypes.bool,
    userById: PropTypes.object,
  };

  someMethod = () => {};

  render() {
    return <div>Hello from logged in route.</div>;
  }
}

const LoggedInRouteContainer = flowRight(
  WithLoggedInUser(),
  WithActiveModule()
)(LoggedInRoute);

export default LoggedInRouteContainer;
