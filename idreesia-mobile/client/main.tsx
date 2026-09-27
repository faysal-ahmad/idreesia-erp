import React from 'react';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';
import { ApolloProvider } from '@apollo/client/react';
import { setDefaultConfig } from 'antd-mobile';
import enUS from 'antd-mobile/cjs/locales/en-US';

import './main.css';
/* Page CSS lives next to its screen as *.styles.css and is loaded only from
 * here (same rule as idreesia-web: a CSS file sharing a .tsx basename breaks
 * Meteor's extensionless imports). */
import '../imports/ui/account/account-screen.styles.css';
import '../imports/ui/modules/security/stay-report/stay-report.styles.css';
import '../imports/ui/modules/security/visitors/photo-search.styles.css';
import '../imports/ui/modules/security/visitors/visitor-detail.styles.css';
import '../imports/ui/modules/security/visitors/visitors-list.styles.css';
import App from '../imports/ui/app';
import { HashRouter } from '../imports/ui/router';
import { applyTheme } from '../imports/ui/theme';
import { apolloClient } from '../imports/startup/apollo-client';

// HashRouter: Cordova serves the bundle from a local origin with no server
// side routing, so path-based URLs don't survive a reload there.
Meteor.startup(() => {
  applyTheme();
  // antd-mobile's built-in text (list ends, pickers, dialogs) defaults to
  // Chinese. setDefaultConfig also covers Dialog/Toast, which render outside
  // any ConfigProvider.
  setDefaultConfig({ locale: enUS });

  const container = document.getElementById('render-target');
  if (!container) return;

  createRoot(container).render(
    <HashRouter>
      <ApolloProvider client={apolloClient}>
        <App />
      </ApolloProvider>
    </HashRouter>
  );
});
