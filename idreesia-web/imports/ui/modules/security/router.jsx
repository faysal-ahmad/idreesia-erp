import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { MehfilCardVerificationForm } from './mehfil-card-verification';
import { KarkunVerificationForm } from './karkun-verification';
import { MehfilsNewForm, MehfilsEditForm, MehfilsList } from './mehfils';
import { MehfilDutiesNewForm, MehfilDutiesEditForm, MehfilDutiesList } from './mehfil-duties';
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
import {
  SharedResidencesNewForm,
  SharedResidencesEditForm,
  SharedResidencesList,
} from './shared-residences';
import { VisitorCardVerificationForm } from './visitor-stays';
import { SecurityUsersList, SecurityUsersEditForm } from './security-users';
import { AuditLogsList } from './audit-logs';
import { VisitorStayReport } from './visitor-stay-report';
import { TeamVisitReport } from './team-visit-report';

const Router = () => (
  <Switch>
    <Route path={paths.mehfilsKarkunListPath()} component={MehfilKarkunsList} />
    <Route path={paths.mehfilsKarkunPrintCardsPath()} component={MehfilKarkunsPrintCards} />
    <Route path={paths.mehfilsKarkunPrintListPath()} component={MehfilKarkunsPrintList} />
    <Route path={paths.mehfilsNewFormPath} component={MehfilsNewForm} />
    <Route path={paths.mehfilsEditFormPath()} component={MehfilsEditForm} />
    <Route path={paths.mehfilsPath} component={MehfilsList} />

    <Route path={paths.mehfilDutiesNewFormPath} component={MehfilDutiesNewForm} />
    <Route path={paths.mehfilDutiesEditFormPath()} component={MehfilDutiesEditForm} />
    <Route path={paths.mehfilDutiesPath} component={MehfilDutiesList} />

    <Route
      path={paths.mehfilCardVerificationPath}
      component={MehfilCardVerificationForm}
    />
    <Route
      path={paths.karkunCardVerificationPath}
      component={KarkunVerificationForm}
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

    <Route
      path={paths.sharedResidencesNewFormPath}
      component={SharedResidencesNewForm}
    />
    <Route
      path={paths.sharedResidencesEditFormPath()}
      component={SharedResidencesEditForm}
    />
    <Route path={paths.sharedResidencesPath} component={SharedResidencesList} />

    <Route path={paths.securityUsersEditFormPath()} component={SecurityUsersEditForm} />
    <Route path={paths.securityUsersPath} component={SecurityUsersList} />

    <Route path={paths.auditLogsPath} component={AuditLogsList} />

    <Route path={paths.visitorStayReportPath} component={VisitorStayReport} />
    <Route path={paths.teamVisitReportPath} component={TeamVisitReport} />
  </Switch>
);

export default Router;
