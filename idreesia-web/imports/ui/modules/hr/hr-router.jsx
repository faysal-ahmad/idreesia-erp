import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { default as paths } from './submodule-paths';
import { JobsNewForm, JobsEditForm, JobsList } from './jobs';
import { DutiesNewForm, DutiesEditForm, DutiesList } from './duties';
import {
  DutyShiftsNewForm,
  DutyShiftsEditForm,
  DutyShiftsList,
} from './duty-shifts';
import {
  DutyLocationsNewForm,
  DutyLocationsEditForm,
  DutyLocationsList,
} from './duty-locations';
import { KarkunsNewForm, KarkunsEditForm, KarkunsList } from './karkuns';
import {
  AttendanceSheetsUploadForm,
  AttendanceSheetsList,
  AttendanceSheetsMeetingCards,
} from './attendance-sheets';
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

    <Route path={paths.dutyShiftsNewFormPath} component={DutyShiftsNewForm} />
    <Route path={paths.dutyShiftsEditFormPath} component={DutyShiftsEditForm} />
    <Route path={paths.dutyShiftsPath} component={DutyShiftsList} />

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
    <Route path={paths.karkunsEditFormPath} component={KarkunsEditForm} />
    <Route path={paths.karkunsPath} component={KarkunsList} />

    <Route
      path={paths.attendanceSheetsUploadFormPath}
      component={AttendanceSheetsUploadForm}
    />
    <Route
      path={paths.attendanceSheetsMeetingCardsPath}
      component={AttendanceSheetsMeetingCards}
    />
    <Route path={paths.attendanceSheetsPath} component={AttendanceSheetsList} />

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
