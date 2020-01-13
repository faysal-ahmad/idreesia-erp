import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { KarkunVerificationForm } from './karkun-verification';
import { MehfilsNewForm, MehfilsEditForm, MehfilsList } from './mehfils';
import { MehfilKarkunsList } from './mehfil-karkuns';
import { MehfilCards } from './mehfil-cards';
import {
  VisitorRegistrationScanForm,
  VisitorRegistrationNewForm,
  VisitorRegistrationEditForm,
  VisitorRegistrationUploadForm,
  VisitorRegistrationList,
} from './visitor-registeration';
import { VisitorCardVerificationForm } from './visitor-stays';
import { VisitorStayReport } from './visitor-stay-report';
import { TeamVisitReport } from './team-visit-report';

const SecurityRouter = () => (
  <Switch>
    <Route path={paths.mehfilsKarkunListPath()} component={MehfilKarkunsList} />
    <Route path={paths.mehfilsKarkunCardsPath()} component={MehfilCards} />

    <Route path={paths.mehfilsNewFormPath} component={MehfilsNewForm} />
    <Route path={paths.mehfilsEditFormPath()} component={MehfilsEditForm} />
    <Route path={paths.mehfilsListPath} component={MehfilsList} />

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

    <Route path={paths.visitorStayReportPath} component={VisitorStayReport} />
    <Route path={paths.teamVisitReportPath} component={TeamVisitReport} />
  </Switch>
);

export default SecurityRouter;
