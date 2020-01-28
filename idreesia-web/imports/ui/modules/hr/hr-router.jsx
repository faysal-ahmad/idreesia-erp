import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { JobsNewForm, JobsEditForm, JobsList } from './jobs';
import { DutiesNewForm, DutiesEditForm, DutiesList } from './duties';
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
  AttendanceSheetsKarkunCards,
  AttendanceSheetsMehfilCards,
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

const HRRouter = () => (
  <Switch>
    <Route path={paths.jobsNewFormPath} component={JobsNewForm} />
    <Route path={paths.jobsEditFormPath()} component={JobsEditForm} />
    <Route path={paths.jobsPath} component={JobsList} />

    <Route path={paths.dutiesNewFormPath} component={DutiesNewForm} />
    <Route path={paths.dutiesEditFormPath()} component={DutiesEditForm} />
    <Route path={paths.dutiesPath} component={DutiesList} />

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
    <Route path={paths.karkunsEditFormPath} component={KarkunsEditForm} />
    <Route path={paths.karkunsPath} component={KarkunsList} />

    <Route
      path={paths.attendanceSheetsKarkunCardsPath}
      component={AttendanceSheetsKarkunCards}
    />
    <Route
      path={paths.attendanceSheetsMehfilCardsPath}
      component={AttendanceSheetsMehfilCards}
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

    <Route
      path={paths.sharedResidencesNewFormPath}
      component={SharedResidencesNewForm}
    />
    <Route
      path={paths.sharedResidencesEditFormPath()}
      component={SharedResidencesEditForm}
    />
    <Route path={paths.sharedResidencesPath} component={SharedResidencesList} />
  </Switch>
);

export default HRRouter;
