import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const withTracker = (require('meteor/react-meteor-data') as any).withTracker;

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

const RouterSwitch = Switch as any;
const RouterRoute = Route as any;
interface Props { userId?: string | null; isOnline?: boolean; }

const App = ({ userId }: Props) => {
  const dispatch = useDispatch<any>();
  useEffect(() => {
    dispatch(setLoggedInUserId(userId || null));
  });

  if (userId) {
    return (
      <RouterSwitch>
        <RouterRoute path="/" component={LoggedInRoute} />
      </RouterSwitch>
    );
  }

  return (
    <RouterSwitch>
      <RouterRoute path="/set-initial-password/:token" component={SetInitialPasswordForm} />
      <RouterRoute path="/reset-forgotten-password/:token" component={ResetForgottenPasswordForm} />
      <RouterRoute path="/" component={LoginRegisterForm} />
    </RouterSwitch>
  );
};

App.propTypes = {
  userId: PropTypes.string,
  isOnline: PropTypes.bool,
};

export default withTracker(() => ({
  userId: Meteor.userId(),
  isOnline: (Meteor as any).status().connected,
}))(App as any);
