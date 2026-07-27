import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { MehfilCardVerificationForm } from './mehfil-card-verification';
import { KarkunVerificationForm } from './karkun-verification';
import { MehfilsNewForm, MehfilsEditForm, MehfilsList } from './mehfils';
import {
  MehfilDutiesNewForm,
  MehfilDutiesEditForm,
  MehfilDutiesList,
} from './setup/mehfil-duties';
import {
  MehfilLangarDishesNewForm,
  MehfilLangarDishesEditForm,
  MehfilLangarDishesList,
} from './setup/mehfil-langar-dishes';
import {
  MehfilLangarLocationsNewForm,
  MehfilLangarLocationsEditForm,
  MehfilLangarLocationsList,
} from './setup/mehfil-langar-locations';
import {
  MehfilKarkunsList,
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

const RouterSwitch = Switch as any;
const RouterRoute = Route as any;

const Router = () => (
  <RouterSwitch>
    <RouterRoute path={paths.mehfilsKarkunListPath()} component={MehfilKarkunsList} />
    <RouterRoute path={paths.mehfilsKarkunPrintCardsPath()} component={MehfilKarkunsPrintCards} />
    <RouterRoute path={paths.mehfilsKarkunPrintListPath()} component={MehfilKarkunsPrintList} />
    <RouterRoute path={paths.mehfilsNewFormPath} component={MehfilsNewForm} />
    <RouterRoute path={paths.mehfilsEditFormPath()} component={MehfilsEditForm} />
    <RouterRoute path={paths.mehfilsPath} component={MehfilsList} />

    <RouterRoute path={paths.mehfilDutiesNewFormPath} component={MehfilDutiesNewForm} />
    <RouterRoute path={paths.mehfilDutiesEditFormPath()} component={MehfilDutiesEditForm} />
    <RouterRoute path={paths.mehfilDutiesPath} component={MehfilDutiesList} />

    <RouterRoute path={paths.mehfilLangarDishesNewFormPath} component={MehfilLangarDishesNewForm} />
    <RouterRoute path={paths.mehfilLangarDishesEditFormPath()} component={MehfilLangarDishesEditForm} />
    <RouterRoute path={paths.mehfilLangarDishesPath} component={MehfilLangarDishesList} />

    <RouterRoute path={paths.mehfilLangarLocationsNewFormPath} component={MehfilLangarLocationsNewForm} />
    <RouterRoute path={paths.mehfilLangarLocationsEditFormPath()} component={MehfilLangarLocationsEditForm} />
    <RouterRoute path={paths.mehfilLangarLocationsPath} component={MehfilLangarLocationsList} />

    <RouterRoute
      path={paths.mehfilCardVerificationPath}
      component={MehfilCardVerificationForm}
    />
    <RouterRoute
      path={paths.karkunCardVerificationPath}
      component={KarkunVerificationForm}
    />

    <RouterRoute
      path={paths.visitorRegistrationListPath}
      component={VisitorRegistrationList}
    />
    <RouterRoute
      path={paths.visitorRegistrationNewFormPath}
      component={VisitorRegistrationNewForm}
    />
    <RouterRoute
      path={paths.visitorRegistrationUploadFormPath}
      component={VisitorRegistrationUploadForm}
    />
    <RouterRoute
      path={paths.visitorRegistrationEditFormPath()}
      component={VisitorRegistrationEditForm}
    />
    <RouterRoute
      path={paths.visitorRegistrationPath}
      component={VisitorRegistrationScanForm}
    />
    <RouterRoute
      path={paths.visitorCardVerificationPath}
      component={VisitorCardVerificationForm}
    />
    <RouterRoute path={paths.visitorStayReportPath} component={VisitorStayReport} />

    <RouterRoute path={paths.securityUsersEditFormPath()} component={SecurityUsersEditForm} />
    <RouterRoute path={paths.securityUsersPath} component={SecurityUsersList} />

    <RouterRoute path={paths.auditLogsPath} component={AuditLogsList} />

  </RouterSwitch>
);

export default Router;
