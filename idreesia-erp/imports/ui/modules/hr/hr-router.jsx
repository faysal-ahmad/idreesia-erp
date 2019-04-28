import React from "react";
import { Switch, Route } from "react-router-dom";

import { default as paths } from "./submodule-paths";
import {
  DutiesNewForm,
  DutiesEditForm,
  DutiesList,
  DutiesAttendance,
} from "./duties";
import {
  DutyShiftsNewForm,
  DutyShiftsEditForm,
  DutyShiftsList,
} from "./duty-shifts";
import {
  DutyLocationsNewForm,
  DutyLocationsEditForm,
  DutyLocationsList,
} from "./duty-locations";
import {
  KarkunsNewForm,
  KarkunsEditForm,
  KarkunsList,
  KarkunsSearch,
} from "./karkuns";
import {
  AttendanceSheetsUploadForm,
  AttendanceSheetsList,
  AttendanceSheetsMeetingCards,
} from "./attendance-sheets";

const HRRouter = () => (
  <Switch>
    <Route path={paths.dutiesNewFormPath} component={DutiesNewForm} />
    <Route path={paths.dutiesAttendancePath()} component={DutiesAttendance} />
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
    <Route path={paths.karkunsSearchPath} component={KarkunsSearch} />
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
  </Switch>
);

export default HRRouter;
