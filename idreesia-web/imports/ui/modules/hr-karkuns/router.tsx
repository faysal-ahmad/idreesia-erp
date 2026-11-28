import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { MSDutiesList } from './ms-duties';
import { TeamsList } from './teams';
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
import { AuditLogsList } from './audit-logs';
import { PermissionsPage } from './permissions';
import { DutyAttendanceList, DutyPlanningList } from './duty-planning';

const Router = () => (
  <Switch>
    <Route path={paths.msDutiesPath} component={MSDutiesList} />
    <Route path={paths.teamsPath} component={TeamsList} />

    <Route path={paths.karkunsNewFormPath} component={KarkunsNewForm} />
    <Route path={paths.karkunsPrintListPath} component={KarkunsPrintView} />
    <Route path={paths.karkunsPrintPath()} component={KarkunPrintView} />
    <Route path={paths.karkunsEditFormPath()} component={KarkunsEditForm} />
    <Route path={paths.karkunsPath} component={KarkunsList} />

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

    <Route path={paths.auditLogsPath} component={AuditLogsList} />
    <Route path={paths.permissionsPath} component={PermissionsPage} />
  </Switch>
);

export default Router;
