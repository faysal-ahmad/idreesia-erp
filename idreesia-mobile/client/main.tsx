import React from 'react';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';
import { ApolloProvider } from '@apollo/client/react';
import { ErrorBoundary } from 'react-error-boundary';
import { setDefaultConfig } from 'antd-mobile';
import enUS from 'antd-mobile/cjs/locales/en-US';

import './main.css';
/* Page CSS lives next to its screen as *.styles.css and is loaded only from
 * here (same rule as idreesia-web: a CSS file sharing a .tsx basename breaks
 * Meteor's extensionless imports). */
import '../imports/ui/account/account-screen.styles.css';
import '../imports/ui/account/two-factor.styles.css';
import '../imports/ui/chat/chat-screen.styles.css';
import '../imports/ui/components/message-composer/message-composer.styles.css';
import '../imports/ui/components/collapsible-section.styles.css';
import '../imports/ui/components/video-call/video-call-prejoin-popup.styles.css';
import '../imports/ui/home/home-screen.styles.css';
import '../imports/ui/workspaces/workspaces-screen.styles.css';
import '../imports/ui/workspaces/location-picker.styles.css';
import '../imports/ui/workspaces/duties-attendance/duties-attendance.styles.css';
import '../imports/ui/apps/security/stay-report/stay-report.styles.css';
import '../imports/ui/apps/security/visitors/photo-search.styles.css';
import '../imports/ui/apps/security/visitors/visitor-detail.styles.css';
import '../imports/ui/apps/security/visitors/visitors-list.styles.css';
import '../imports/ui/workspaces/discussions/discussions-screen.styles.css';
import '../imports/ui/workspaces/members/members-screen.styles.css';
import '../imports/ui/workspaces/night-stay-report/night-stay-detail.styles.css';
import '../imports/ui/workspaces/night-stay-report/night-stay-report.styles.css';
import '../imports/ui/workspaces/monitoring-alerts/monitoring-alerts.styles.css';
import '../imports/ui/workspaces/monitoring-profiles/monitoring-profile.styles.css';
import '../imports/ui/workspaces/monitoring-profiles/monitoring-profiles.styles.css';
import '../imports/ui/workspaces/meetings/meetings.styles.css';
import '../imports/ui/workspaces/polls/polls.styles.css';
import '../imports/ui/workspaces/projects/projects.styles.css';
import '../imports/ui/workspaces/documents/documents.styles.css';
import App from '../imports/ui/app';
import { HashRouter } from '../imports/ui/router';
import { applyTheme, watchTextScale } from '../imports/ui/theme';
import { apolloClient } from '../imports/startup/apollo-client';
import { restoreApolloCache } from '../imports/startup/apollo-persist';
import { initMonitoring, reportError } from '../imports/startup/monitoring';

initMonitoring();

// Errors that escape React (event handlers, timers, unhandled promises).
window.addEventListener('error', event => {
  reportError(event.error ?? event.message, { source: 'window-error' });
});
window.addEventListener('unhandledrejection', event => {
  reportError(event.reason, { source: 'unhandled-rejection' });
});

// HashRouter: Cordova serves the bundle from a local origin with no server
// side routing, so path-based URLs don't survive a reload there.
Meteor.startup(async () => {
  applyTheme();
  watchTextScale();
  // antd-mobile's built-in text (list ends, pickers, dialogs) defaults to
  // Chinese. setDefaultConfig also covers Dialog/Toast, which render outside
  // any ConfigProvider.
  setDefaultConfig({ locale: enUS });

  const container = document.getElementById('render-target');
  if (!container) return;

  // Load what was browsed last time, so screens can show it offline. This
  // gives up after a few seconds and never throws, so it can't block launch.
  await restoreApolloCache();

  createRoot(container).render(
    <HashRouter>
      <ApolloProvider client={apolloClient}>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <div style={{ padding: 24 }}>
              <h3>Something went wrong</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {error?.message ?? String(error)}
              </pre>
            </div>
          )}
          onError={error => reportError(error, { source: 'app-root' })}
        >
          <App />
        </ErrorBoundary>
      </ApolloProvider>
    </HashRouter>
  );
});
