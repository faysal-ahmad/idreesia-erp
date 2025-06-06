import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { useDispatch } from 'react-redux';

/**
 * Workaround to get dayjs latest version to work with
 * rc-component/picker. Basically DatePicker throws errors
 * without this when clicking on control to display picker.
 * https://github.com/ant-design/ant-design/issues/26190
 */
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
dayjs.extend(duration);
dayjs.extend(localeData);
dayjs.extend(weekday);
// *********************************************************

import { setLoggedInUserId } from 'meteor/idreesia-common/action-creators';

import {
  LoggedInRoute,
  LoginRegisterForm,
  ResetForgottenPasswordForm,
  SetInitialPasswordForm,
} from './main-layout';

const App = ({ userId }) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setLoggedInUserId(userId || null));
  });

  if (userId) {
    return (
      <Switch>
        <Route path="/" component={LoggedInRoute} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/set-initial-password/:token" component={SetInitialPasswordForm} />
      <Route path="/reset-forgotten-password/:token" component={ResetForgottenPasswordForm} />
      <Route path="/" component={LoginRegisterForm} />
    </Switch>
  );
};

App.propTypes = {
  userId: PropTypes.string,
  isOnline: PropTypes.bool,
};

export default withTracker(() => ({
  userId: Meteor.userId(),
  isOnline: Meteor.status().connected,
}))(App);
