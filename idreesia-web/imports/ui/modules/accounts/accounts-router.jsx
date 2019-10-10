import React from "react";
import { Switch, Route } from "react-router-dom";

import { default as paths } from "./submodule-paths";
import { VouchersList, VouchersNewForm, VouchersEditForm } from "./vouchers";
import { AccountHeadsList, AccountHeadsEditForm } from "./account-heads";
import { ActivitySheetList } from "./activity-sheet";
import {
  AmaanatLogsList,
  AmaanatLogsNewForm,
  AmaanatLogsEditForm,
} from "./amaanat-logs";

const AccountsRouter = () => (
  <Switch>
    <Route
      path={paths.accountHeadsEditFormPath(":companyId")}
      component={AccountHeadsEditForm}
    />
    <Route
      path={paths.accountHeadsPath(":companyId")}
      component={AccountHeadsList}
    />

    <Route
      path={paths.activitySheetPath(":companyId")}
      component={ActivitySheetList}
    />

    <Route path={paths.vouchersNewFormPath()} component={VouchersNewForm} />
    <Route path={paths.vouchersEditFormPath()} component={VouchersEditForm} />
    <Route path={paths.vouchersPath()} component={VouchersList} />

    <Route path={paths.amaanatLogsNewFormPath} component={AmaanatLogsNewForm} />
    <Route
      path={paths.amaanatLogsEditFormPath()}
      component={AmaanatLogsEditForm}
    />
    <Route path={paths.amaanatLogsPath} component={AmaanatLogsList} />
  </Switch>
);

export default AccountsRouter;