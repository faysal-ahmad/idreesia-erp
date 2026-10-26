import React from 'react';

import PlanAttendanceView from './plan-attendance-view';
import type { PlanDuty, PlanLocation, PlanWeeklyViewHandle } from './plan-weekly-view';

interface Props {
  duty: PlanDuty;
  location: PlanLocation;
  startDate: string;
}

const AttendanceDaysView = React.forwardRef<PlanWeeklyViewHandle, Props>(
  (props, ref) => <PlanAttendanceView ref={ref} {...props} dayCount={3} showImages />
);

export default AttendanceDaysView;
