import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { MehfilCardVerificationForm } from './mehfil-card-verification';
import { MehfilsEditForm, MehfilsList } from './mehfils';
import {
  MehfilDutiesEditForm,
  MehfilDutiesList,
} from './setup/mehfil-duties';
import {
  MehfilLangarDishesEditForm,
  MehfilLangarDishesList,
} from './setup/mehfil-langar-dishes';
import {
  MehfilLangarLocationsEditForm,
  MehfilLangarLocationsList,
} from './setup/mehfil-langar-locations';
import {
  MehfilKarkunsPrintCards,
  MehfilKarkunsPrintList,
} from './mehfil-karkuns';
import {
  VisitorRegistrationScanForm,
  VisitorRegistrationNewForm,
  VisitorRegistrationEditForm,
  VisitorRegistrationUploadForm,
  VisitorRegistrationList,
} from './visitor-registeration';
import { VisitorCardVerificationForm } from './visitor-stays';
import { SecurityUsersList, SecurityUsersEditForm } from './security-users';
import { AuditLogsList } from './audit-logs';
import { VisitorStayReport } from './visitor-stay-report';
import {
  SecurityServerAlertsList,
  SecurityServerChannelsList,
  SecurityServerProfilesList,
} from './security-server';

const Router = () => (
  <Switch>
    <Route path={paths.mehfilsKarkunPrintCardsPath()} component={MehfilKarkunsPrintCards} />
    <Route path={paths.mehfilsKarkunPrintListPath()} component={MehfilKarkunsPrintList} />
    <Route path={paths.mehfilsEditFormPath()} component={MehfilsEditForm} />
    <Route path={paths.mehfilsPath} component={MehfilsList} />

    <Route path={paths.mehfilDutiesEditFormPath()} component={MehfilDutiesEditForm} />
    <Route path={paths.mehfilDutiesPath} component={MehfilDutiesList} />

    <Route path={paths.mehfilLangarDishesEditFormPath()} component={MehfilLangarDishesEditForm} />
    <Route path={paths.mehfilLangarDishesPath} component={MehfilLangarDishesList} />

    <Route path={paths.mehfilLangarLocationsEditFormPath()} component={MehfilLangarLocationsEditForm} />
    <Route path={paths.mehfilLangarLocationsPath} component={MehfilLangarLocationsList} />

    <Route
      path={paths.mehfilCardVerificationPath}
      component={MehfilCardVerificationForm}
    />

    <Route
      path={paths.visitorRegistrationListPath}
      component={VisitorRegistrationList}
    />
    <Route
      path={paths.visitorRegistrationNewFormPath}
      component={VisitorRegistrationNewForm}
    />
    <Route
      path={paths.visitorRegistrationUploadFormPath}
      component={VisitorRegistrationUploadForm}
    />
    <Route
      path={paths.visitorRegistrationEditFormPath()}
      component={VisitorRegistrationEditForm}
    />
    <Route
      path={paths.visitorRegistrationPath}
      component={VisitorRegistrationScanForm}
    />
    <Route
      path={paths.visitorCardVerificationPath}
      component={VisitorCardVerificationForm}
    />
    <Route path={paths.visitorStayReportPath} component={VisitorStayReport} />

    <Route path={paths.securityServerChannelsPath} component={SecurityServerChannelsList} />
    <Route path={paths.securityServerProfilesPath} component={SecurityServerProfilesList} />
    <Route path={paths.securityServerAlertsPath} component={SecurityServerAlertsList} />

    <Route path={paths.securityUsersEditFormPath()} component={SecurityUsersEditForm} />
    <Route path={paths.securityUsersPath} component={SecurityUsersList} />

    <Route path={paths.auditLogsPath} component={AuditLogsList} />

  </Switch>
);

export default Router;
