import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { JobsNewForm, JobsEditForm, JobsList } from './jobs';
import { MSDutiesNewForm, MSDutiesEditForm, MSDutiesList } from './ms-duties';
import { MessagesList, MessagesNewForm, MessagesEditForm } from './messages';
import {
  DutyLocationsNewForm,
  DutyLocationsEditForm,
  DutyLocationsList,
} from './duty-locations';
import {
  KarkunsNewForm,
  KarkunsEditForm,
  KarkunsList,
  KarkunsScanCard,
  KarkunPrintView,
} from './karkuns';
import {
  AttendanceSheetsList,
  AttendanceSheetsMeetingCards,
  AttendanceSheetsKarkunCards,
} from './attendance-sheets';
import {
  SalarySheetsList,
  SalarySheetsSalaryReceipts,
  SalarySheetsRashanReceipts,
} from './salary-sheets';
import {
  SharedResidencesNewForm,
  SharedResidencesEditForm,
  SharedResidencesList,
} from './shared-residences';
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
    <Route path={paths.karkunsPrintPath()} component={KarkunPrintView} />
    <Route path={paths.karkunsEditFormPath()} component={KarkunsEditForm} />
    <Route path={paths.karkunsPath} component={KarkunsList} />

    <Route
      path={paths.attendanceSheetsMeetingCardsPath}
      component={AttendanceSheetsMeetingCards}
    />
    <Route
      path={paths.attendanceSheetsKarkunCardsPath}
      component={AttendanceSheetsKarkunCards}
    />
    <Route path={paths.attendanceSheetsPath} component={AttendanceSheetsList} />

    <Route
      path={paths.salarySheetsSalaryReceiptsPath}
      component={SalarySheetsSalaryReceipts}
    />
    <Route
      path={paths.salarySheetsRashanReceiptsPath}
      component={SalarySheetsRashanReceipts}
    />
    <Route path={paths.salarySheetsPath} component={SalarySheetsList} />

    <Route path={paths.messagesNewFormPath} component={MessagesNewForm} />
    <Route path={paths.messagesEditFormPath()} component={MessagesEditForm} />
    <Route path={paths.messagesPath} component={MessagesList} />

    <Route
      path={paths.sharedResidencesNewFormPath}
      component={SharedResidencesNewForm}
    />
    <Route
      path={paths.sharedResidencesEditFormPath()}
      component={SharedResidencesEditForm}
    />
    <Route path={paths.sharedResidencesPath} component={SharedResidencesList} />

    <Route path={paths.auditLogsPath} component={AuditLogsList} />
  </Switch>
);

export default Router;
