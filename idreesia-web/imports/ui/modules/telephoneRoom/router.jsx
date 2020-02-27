import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { VisitorsNewForm, VisitorsEditForm, VisitorsList } from './visitors';
import { MulakaatReport } from './mulakaat-report';
import { NewEhadReport } from './new-ehad-report';

import { default as paths } from './submodule-paths';

const Router = () => (
  <Switch>
    <Route path={paths.visitorsNewFormPath} component={VisitorsNewForm} />
    <Route path={paths.visitorsEditFormPath()} component={VisitorsEditForm} />
    <Route path={paths.visitorsPath} component={VisitorsList} />

    <Route path={paths.mulakaatReportPath} component={MulakaatReport} />
    <Route path={paths.newEhadReportPath} component={NewEhadReport} />
  </Switch>
);

export default Router;
