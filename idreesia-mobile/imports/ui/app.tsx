import React, { useEffect, useState } from 'react';
import { ErrorBlock, NoticeBar, SpinLoading } from 'antd-mobile';

import { backendUrl } from '/imports/startup/backend';
import { AccountPaths, AccountScreen, ChangePasswordScreen } from './account';
import { ForgotPasswordScreen, LoginScreen, RegisterScreen } from './auth/screens';
import { ChatPaths, ChatScreen } from './chat';
import { HomePaths, HomeStack } from './home';
import { useAuthState } from './hooks';
import { AppTabBar, isTabRoot, NavigationTracker } from './layout';
import { AppsPaths, ModulesScreen, renderModuleRoutes } from './apps';
import { Redirect, Route, Switch, useLocation } from './router';
import { WorkspacesPaths } from './workspaces';

const SignedOutRoutes = () => (
  <Switch>
    <Route exact path="/login" component={LoginScreen} />
    <Route exact path="/register" component={RegisterScreen} />
    <Route exact path="/forgot-password" component={ForgotPasswordScreen} />
    {/* Public chat with the team; needs no account (imports/ui/chat). */}
    <Route exact path={ChatPaths.chat} component={ChatScreen} />
    <Redirect to="/login" />
  </Switch>
);

// Home tab (the default after signing in), Apps tab → module → feature
// (see imports/ui/apps), and the Account tab. The tab bar only shows on the tabs' root screens; drill-down screens
// are full-screen with a back arrow.
const SignedInRoutes = () => {
  const { pathname } = useLocation();
  return (
    <div className="signed-in">
      <div className="signed-in-content">
        <Switch>
          {/* Home and the workspace screens opened from it (imports/ui/workspaces). */}
          <Route path={[HomePaths.home, WorkspacesPaths.root]} component={HomeStack} />
          <Route exact path={AppsPaths.apps} component={ModulesScreen} />
          <Route exact path={AccountPaths.account} component={AccountScreen} />
          <Route exact path={AccountPaths.changePassword} component={ChangePasswordScreen} />
          {renderModuleRoutes()}
          <Redirect to={HomePaths.home} />
        </Switch>
      </div>
      {isTabRoot(pathname) && <AppTabBar pathname={pathname} />}
    </div>
  );
};

const App = () => {
  const { userId, loggingIn, connected, status } = useAuthState();
  // Only the startup resume of a stored session gets the splash. An
  // interactive login also sets loggingIn, and swapping the screen out then
  // would remount the login form and wipe what the user typed.
  const [startupSettled, setStartupSettled] = useState(!loggingIn);
  useEffect(() => {
    if (!loggingIn) setStartupSettled(true);
  }, [loggingIn]);

  if (!backendUrl) {
    return (
      <div className="app-center">
        <ErrorBlock
          fullPage
          status="default"
          title="Backend not configured"
          description="Set public.backendUrl in the Meteor settings for this app."
        />
      </div>
    );
  }

  let content;
  if (!startupSettled && !userId) {
    content = (
      <div className="app-center">
        <SpinLoading color="primary" style={{ '--size': '40px' }} />
      </div>
    );
  } else {
    content = userId ? <SignedInRoutes /> : <SignedOutRoutes />;
  }

  return (
    <div className="app">
      <NavigationTracker />
      {!connected && status && (
        <NoticeBar
          className="connection-notice"
          color="alert"
          content={
            status === 'connecting'
              ? 'Connecting to server…'
              : 'Offline. Reconnecting to server…'
          }
        />
      )}
      {content}
    </div>
  );
};

export default App;
