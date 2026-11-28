import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { JobsEditForm, JobsList } from './jobs';
import { LeaveRequestView, LeavesList, LeaveTypesList } from './leaves';
import {
  EmployeeEditForm,
  EmployeesList,
  EmployeePrintView,
  EmployeesPrintView,
} from './employees';
import {
  SalarySheetsList,
  SalarySheetsSalaryReceipts,
  SalarySheetsRashanReceipts,
  SalarySheetsEidReceipts,
} from './salary-sheets';
import { AuditLogsList } from './audit-logs';
import { PermissionsPage } from './permissions';

const Router = () => (
  <Switch>
    <Route path={paths.jobsEditFormPath()} component={JobsEditForm} />
    <Route path={paths.jobsPath} component={JobsList} />

    <Route path={paths.leaveTypesPath} component={LeaveTypesList} />
    <Route path={paths.leaveRequestPath()} component={LeaveRequestView} />
    <Route path={paths.leavesPath} component={LeavesList} />

    <Route path={paths.employeesPrintListPath} component={EmployeesPrintView} />
    <Route path={paths.employeePrintPath()} component={EmployeePrintView} />
    <Route path={paths.employeeEditFormPath()} component={EmployeeEditForm} />
    <Route path={paths.employeesPath} component={EmployeesList} />

    <Route
      path={paths.salarySheetsSalaryReceiptsPath}
      component={SalarySheetsSalaryReceipts}
    />
    <Route
      path={paths.salarySheetsRashanReceiptsPath}
      component={SalarySheetsRashanReceipts}
    />
    <Route
      path={paths.salarySheetsEidReceiptsPath}
      component={SalarySheetsEidReceipts}
    />
    <Route path={paths.salarySheetsPath} component={SalarySheetsList} />

    <Route path={paths.auditLogsPath} component={AuditLogsList} />
    <Route path={paths.permissionsPath} component={PermissionsPage} />
  </Switch>
);

export default Router;
