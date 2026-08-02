import React from 'react';
import { Switch, Route } from 'react-router-dom';

const RouterSwitch = Switch as any;
const RouterRoute = Route as any;

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
  <RouterSwitch>
    <RouterRoute path={paths.jobsNewFormPath} component={JobsNewForm} />
    <RouterRoute path={paths.jobsEditFormPath()} component={JobsEditForm} />
    <RouterRoute path={paths.jobsPath} component={JobsList} />

    <RouterRoute path={paths.msDutiesNewFormPath} component={MSDutiesNewForm} />
    <RouterRoute path={paths.msDutiesEditFormPath()} component={MSDutiesEditForm} />
    <RouterRoute path={paths.msDutiesPath} component={MSDutiesList} />

    <RouterRoute
      path={paths.dutyLocationsNewFormPath}
      component={DutyLocationsNewForm}
    />
    <RouterRoute
      path={paths.dutyLocationsEditFormPath}
      component={DutyLocationsEditForm}
    />
    <RouterRoute path={paths.dutyLocationsPath} component={DutyLocationsList} />

    <RouterRoute path={paths.karkunsNewFormPath} component={KarkunsNewForm} />
    <RouterRoute path={paths.karkunsScanCardPath} component={KarkunsScanCard} />
    <RouterRoute path={paths.karkunsPrintListPath} component={KarkunsPrintView} />
    <RouterRoute path={paths.karkunsPrintPath()} component={KarkunPrintView} />
    <RouterRoute path={paths.karkunsEditFormPath()} component={KarkunsEditForm} />
    <RouterRoute path={paths.karkunsPath} component={KarkunsList} />

    <RouterRoute path={paths.personNewFormPath} component={PersonNewForm} />
    <RouterRoute path={paths.personScanCardPath} component={PersonScanCard} />
    <RouterRoute path={paths.peoplePrintListPath} component={PeoplePrintView} />
    <RouterRoute path={paths.personPrintPath()} component={PersonPrintView} />
    <RouterRoute path={paths.personEditFormPath()} component={PersonEditForm} />
    <RouterRoute path={paths.peoplePath} component={PeopleList} />

    <RouterRoute
      path={paths.attendanceSheetsMeetingCardsPath}
      component={AttendanceSheetsPrintMeetingCards}
    />
    <RouterRoute
      path={paths.attendanceSheetsKarkunCardsPath}
      component={AttendanceSheetsPrintKarkunCards}
    />
    <RouterRoute path={paths.attendanceSheetsPrintAttendanceSheetPath} component={AttendanceSheetPrintAttendanceSheet} />
    <RouterRoute path={paths.attendanceSheetsPath} component={AttendanceSheetsList} />

    <RouterRoute
      path={paths.salarySheetsSalaryReceiptsPath}
      component={SalarySheetsSalaryReceipts}
    />
    <RouterRoute
      path={paths.salarySheetsRashanReceiptsPath}
      component={SalarySheetsRashanReceipts}
    />
    <RouterRoute
      path={paths.salarySheetsEidReceiptsPath}
      component={SalarySheetsEidReceipts}
    />
    <RouterRoute path={paths.salarySheetsPath} component={SalarySheetsList} />

    <RouterRoute path={paths.auditLogsPath} component={AuditLogsList} />
  </RouterSwitch>
);

export default Router;
