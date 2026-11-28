import React from 'react';

import PlanWeeklyView, {
  type PlanDuty,
  type PlanLocation,
  type PlanWeeklyViewHandle,
} from './plan-weekly-view';

interface Props {
  duty: PlanDuty;
  location: PlanLocation;
  startDate: string;
}

export type PlanDaysViewHandle = PlanWeeklyViewHandle;

const PlanDaysView = React.forwardRef<PlanDaysViewHandle, Props>(
  (props, ref) => (
    <PlanWeeklyView ref={ref} {...props} dayCount={3} showImages />
  )
);

export default PlanDaysView;
