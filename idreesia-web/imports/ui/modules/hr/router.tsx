import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { JobsEditForm, JobsList } from './jobs';
import { MSDutiesList } from './ms-duties';
import { TeamsList } from './teams';
import { CommitteesList } from './committees';
import {
  EmployeeEditForm,
  EmployeesList,
  EmployeePrintView,
  EmployeesPrintView,
} from './employees';
import {
  KarkunsNewForm,
  KarkunsEditForm,
  KarkunsList,
  KarkunPrintView,
  KarkunsPrintView,
} from './karkuns';
import {
  AttendanceReportList,
  AttendanceReportPrintMeetingCards,
  AttendanceReportPrintKarkunCards,
  AttendanceReportPrintSheet,
} from './attendance-report';
import {
  SalarySheetsList,
  SalarySheetsSalaryReceipts,
  SalarySheetsRashanReceipts,
  SalarySheetsEidReceipts,
} from './salary-sheets';
import { AuditLogsList } from './audit-logs';
import { DutyAttendanceList, DutyPlanningList } from './duty-planning';

const Router = () => (
  <Switch>
    <Route path={paths.jobsEditFormPath()} component={JobsEditForm} />
    <Route path={paths.jobsPath} component={JobsList} />

    <Route path={paths.msDutiesPath} component={MSDutiesList} />

    <Route path={paths.teamsPath} component={TeamsList} />

    <Route path={paths.committeesPath} component={CommitteesList} />

    <Route path={paths.karkunsNewFormPath} component={KarkunsNewForm} />
    <Route path={paths.karkunsPrintListPath} component={KarkunsPrintView} />
    <Route path={paths.karkunsPrintPath()} component={KarkunPrintView} />
    <Route path={paths.karkunsEditFormPath()} component={KarkunsEditForm} />
    <Route path={paths.karkunsPath} component={KarkunsList} />

    <Route path={paths.employeesPrintListPath} component={EmployeesPrintView} />
    <Route path={paths.employeePrintPath()} component={EmployeePrintView} />
    <Route path={paths.employeeEditFormPath()} component={EmployeeEditForm} />
    <Route path={paths.employeesPath} component={EmployeesList} />

    <Route
      path={paths.attendanceReportMeetingCardsPath}
      component={AttendanceReportPrintMeetingCards}
    />
    <Route
      path={paths.attendanceReportKarkunCardsPath}
      component={AttendanceReportPrintKarkunCards}
    />
    <Route path={paths.attendanceReportPrintSheetPath} component={AttendanceReportPrintSheet} />
    <Route path={paths.dutyPlanningPath} component={DutyPlanningList} />
    <Route path={paths.dutyAttendancePath} component={DutyAttendanceList} />

    <Route path={paths.attendanceReportPath} component={AttendanceReportList} />

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
  </Switch>
);

export default Router;
