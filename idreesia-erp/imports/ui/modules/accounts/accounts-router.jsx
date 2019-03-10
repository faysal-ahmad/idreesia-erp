import React from "react";
import { Switch, Route } from "react-router-dom";

import { default as paths } from "./submodule-paths";
import { VouchersList } from "./vouchers";
import { AccountHeadsList, AccountHeadsEditForm } from "./account-heads";

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

    <Route path={paths.vouchersPath(":companyId")} component={VouchersList} />
  </Switch>
);

export default AccountsRouter;
