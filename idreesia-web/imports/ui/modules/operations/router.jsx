import React from 'react';
import { Switch, Route } from 'react-router-dom';

import {
  VisitorsNewForm,
  VisitorsScanForm,
  VisitorsEditForm,
  VisitorsList,
} from './visitors';

import { WazaifInventoryList, WazaifInventoryNewForm, WazaifInventoryEditForm } from './wazaif-management/wazaif-inventory';

import { MessagesList, MessagesNewForm, MessagesEditForm } from './messages';
import {
  ImdadReasonsNewForm,
  ImdadReasonsEditForm,
  ImdadReasonsList,
} from './imdad-management/imdad-reasons';
import {
  ImdadRequestsList,
  ImdadRequestsNewForm,
  ImdadRequestsEditForm,
} from './imdad-management/imdad-requests';
import { ImdadRequestReport } from './imdad-management/imdad-request-report';

import { NewEhadReport } from './new-ehad-report';

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

    <Route path={paths.wazaifInventoryNewFormPath} component={WazaifInventoryNewForm} />
    <Route path={paths.wazaifInventoryEditFormPath()} component={WazaifInventoryEditForm} />
    <Route path={paths.wazaifInventoryPath} component={WazaifInventoryList} />

    <Route
      path={paths.imdadReasonsNewFormPath}
      component={ImdadReasonsNewForm}
    />
    <Route
      path={paths.imdadReasonsEditFormPath()}
      component={ImdadReasonsEditForm}
    />
    <Route path={paths.imdadReasonsPath} component={ImdadReasonsList} />

    <Route
      path={paths.imdadRequestsNewFormPath}
      component={ImdadRequestsNewForm}
    />
    <Route
      path={paths.imdadRequestsEditFormPath()}
      component={ImdadRequestsEditForm}
    />
    <Route path={paths.imdadRequestsPath} component={ImdadRequestsList} />

    <Route path={paths.newEhadReportPath} component={NewEhadReport} />
    <Route path={paths.imdadRequestReportPath} component={ImdadRequestReport} />
  </Switch>
);

export default Router;
