import React from "react";
import { Switch, Route } from "react-router-dom";

import { default as paths } from "./submodule-paths";
import { VouchersNewForm, VouchersEditForm, VouchersList } from "./vouchers";

const AccountsRouter = () => (
  <Switch>
    <Route
      path={paths.vouchersNewFormPath(":companyId")}
      component={VouchersNewForm}
    />
    <Route
      path={paths.vouchersEditFormPath(":companyId")}
      component={VouchersEditForm}
    />
    <Route path={paths.vouchersPath(":companyId")} component={VouchersList} />
  </Switch>
);

export default AccountsRouter;
