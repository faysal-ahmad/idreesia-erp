import React from "react";
import { Switch, Route } from "react-router-dom";

import { default as paths } from "./submodule-paths";
import { VouchersList } from "./vouchers";
import { AccountHeadsList, AccountHeadsEditForm } from "./account-heads";
import { ActivitySheetList } from "./activity-sheet";

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

    <Route path={paths.vouchersPath(":companyId")} component={VouchersList} />
  </Switch>
);

export default AccountsRouter;
