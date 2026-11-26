import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { EventCardVerificationForm } from './event-card-verification';
import { EventsEditForm, EventsList } from './events';
import {
  EventDutiesEditForm,
  EventDutiesList,
} from './setup/event-duties';
import {
  EventLangarDishesEditForm,
  EventLangarDishesList,
} from './setup/event-langar-dishes';
import {
  EventLangarLocationsEditForm,
  EventLangarLocationsList,
} from './setup/event-langar-locations';
import {
  EventKarkunsPrintCards,
  EventKarkunsPrintList,
} from './event-karkuns';
import {
  VisitorRegistrationScanForm,
  VisitorRegistrationNewForm,
  VisitorRegistrationEditForm,
  VisitorRegistrationUploadForm,
  VisitorRegistrationList,
} from './visitor-registeration';
import { VisitorCardVerificationForm } from './visitor-stays';
import { PermissionsPage } from './permissions';
import { AuditLogsList } from './audit-logs';
import { VisitorStayReport } from './visitor-stay-report';
import {
  SecurityServerAlertsList,
  SecurityServerChannelsList,
  SecurityServerProfilesList,
  SecurityServerUsage,
} from './security-server';

const Router = () => (
  <Switch>
    <Route path={paths.eventsKarkunPrintCardsPath()} component={EventKarkunsPrintCards} />
    <Route path={paths.eventsKarkunPrintListPath()} component={EventKarkunsPrintList} />
    <Route path={paths.eventsEditFormPath()} component={EventsEditForm} />
    <Route path={paths.eventsPath} component={EventsList} />

    <Route path={paths.eventDutiesEditFormPath()} component={EventDutiesEditForm} />
    <Route path={paths.eventDutiesPath} component={EventDutiesList} />

    <Route path={paths.eventLangarDishesEditFormPath()} component={EventLangarDishesEditForm} />
    <Route path={paths.eventLangarDishesPath} component={EventLangarDishesList} />

    <Route path={paths.eventLangarLocationsEditFormPath()} component={EventLangarLocationsEditForm} />
    <Route path={paths.eventLangarLocationsPath} component={EventLangarLocationsList} />

    <Route
      path={paths.eventCardVerificationPath}
      component={EventCardVerificationForm}
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
    <Route path={paths.securityServerUsagePath} component={SecurityServerUsage} />

    <Route path={paths.permissionsPath} component={PermissionsPage} />

    <Route path={paths.auditLogsPath} component={AuditLogsList} />

  </Switch>
);

export default Router;
