import React from 'react';
import { Switch, Route } from 'react-router-dom';

import {
  VisitorsNewForm,
  VisitorsScanForm,
  VisitorsEditForm,
  VisitorsList,
} from './visitors';
import { MessagesList, MessagesNewForm, MessagesEditForm } from './messages';
import { MulakaatReport } from './mulakaat-report';
import { NewEhadReport } from './new-ehad-report';
import { ImdadRequestReport } from './imdad-request-report';

import { default as paths } from './submodule-paths';

const Router = () => (
  <Switch>
    <Route path={paths.visitorsNewFormPath} component={VisitorsNewForm} />
    <Route path={paths.visitorsScanFormPath} component={VisitorsScanForm} />
    <Route path={paths.visitorsEditFormPath()} component={VisitorsEditForm} />
    <Route path={paths.visitorsPath} component={VisitorsList} />

    <Route path={paths.messagesNewFormPath} component={MessagesNewForm} />
    <Route path={paths.messagesEditFormPath()} component={MessagesEditForm} />
    <Route path={paths.messagesPath} component={MessagesList} />

    <Route path={paths.mulakaatReportPath} component={MulakaatReport} />
    <Route path={paths.newEhadReportPath} component={NewEhadReport} />
    <Route path={paths.imdadRequestReportPath} component={ImdadRequestReport} />
  </Switch>
);

export default Router;
