import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { JobsNewForm, JobsEditForm, JobsList } from './jobs';
import { MSDutiesNewForm, MSDutiesEditForm, MSDutiesList } from './ms-duties';
import {
  DutyLocationsNewForm,
  DutyLocationsEditForm,
  DutyLocationsList,
} from './duty-locations';
import {
  PersonNewForm,
  PersonEditForm,
  PeopleList,
  PersonScanCard,
  PersonPrintView,
  PeoplePrintView,
} from './people';
import {
  KarkunsNewForm,
  KarkunsEditForm,
  KarkunsList,
  KarkunsScanCard,
  KarkunPrintView,
  KarkunsPrintView,
} from './karkuns';
import {
  AttendanceSheetsList,
  AttendanceSheetsPrintMeetingCards,
  AttendanceSheetsPrintKarkunCards,
  AttendanceSheetPrintAttendanceSheet,
} from './attendance-sheets';
import {
  SalarySheetsList,
  SalarySheetsSalaryReceipts,
  SalarySheetsRashanReceipts,
  SalarySheetsEidReceipts,
} from './salary-sheets';
import { AuditLogsList } from './audit-logs';

const Router = () => (
  <Switch>
    <Route path={paths.jobsNewFormPath} component={JobsNewForm} />
    <Route path={paths.jobsEditFormPath()} component={JobsEditForm} />
    <Route path={paths.jobsPath} component={JobsList} />

    <Route path={paths.msDutiesNewFormPath} component={MSDutiesNewForm} />
    <Route path={paths.msDutiesEditFormPath()} component={MSDutiesEditForm} />
    <Route path={paths.msDutiesPath} component={MSDutiesList} />

    <Route
      path={paths.dutyLocationsNewFormPath}
      component={DutyLocationsNewForm}
    />
    <Route
      path={paths.dutyLocationsEditFormPath}
      component={DutyLocationsEditForm}
    />
    <Route path={paths.dutyLocationsPath} component={DutyLocationsList} />

    <Route path={paths.karkunsNewFormPath} component={KarkunsNewForm} />
    <Route path={paths.karkunsScanCardPath} component={KarkunsScanCard} />
    <Route path={paths.karkunsPrintListPath} component={KarkunsPrintView} />
    <Route path={paths.karkunsPrintPath()} component={KarkunPrintView} />
    <Route path={paths.karkunsEditFormPath()} component={KarkunsEditForm} />
    <Route path={paths.karkunsPath} component={KarkunsList} />

    <Route path={paths.personNewFormPath} component={PersonNewForm} />
    <Route path={paths.personScanCardPath} component={PersonScanCard} />
    <Route path={paths.peoplePrintListPath} component={PeoplePrintView} />
    <Route path={paths.personPrintPath()} component={PersonPrintView} />
    <Route path={paths.personEditFormPath()} component={PersonEditForm} />
    <Route path={paths.peoplePath} component={PeopleList} />

    <Route
      path={paths.attendanceSheetsMeetingCardsPath}
      component={AttendanceSheetsPrintMeetingCards}
    />
    <Route
      path={paths.attendanceSheetsKarkunCardsPath}
      component={AttendanceSheetsPrintKarkunCards}
    />
    <Route path={paths.attendanceSheetsPrintAttendanceSheetPath} component={AttendanceSheetPrintAttendanceSheet} />
    <Route path={paths.attendanceSheetsPath} component={AttendanceSheetsList} />

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
