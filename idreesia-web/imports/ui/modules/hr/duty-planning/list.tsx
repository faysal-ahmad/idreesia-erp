import React, { useRef, useState } from 'react';
import { type History } from 'history';
import { Empty } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { useBreadcrumbs, useQueryParams } from 'meteor/idreesia-common/hooks/common';

import { todayInKarachi } from './dates';
import PlanDaysView from './plan-days-view';
import PlanSelection from './plan-selection';
import PlanWeeklyView, {
  type PlanWeeklyViewHandle,
} from './plan-weekly-view';

interface ListProps {
  history: History;
  location: {
    pathname: string;
    search: string;
  };
}

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '';

const List = ({ history, location }: ListProps) => {
  useBreadcrumbs(['HR', 'Duty Planning']);
  const planRef = useRef<PlanWeeklyViewHandle>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [daysStart, setDaysStart] = useState(todayInKarachi);
  const [planView, setPlanView] = useState<'days' | 'week'>('week');
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['locationId'],
  });
  const locationId = String(queryParams.locationId || '');

  const handleRefresh = () => {
    const action = planRef.current?.refresh();
    if (!action) return;
    setRefreshing(true);
    action
      .catch((error: unknown) => {
        const text = errorMessage(error);
        if (text) message.error(text, 5);
      })
      .finally(() => setRefreshing(false));
  };

  const PlanView = planView === 'days' ? PlanDaysView : PlanWeeklyView;

  return (
    <PlanSelection
      locationId={locationId}
      onLocationIdChange={value => setPageParams({ locationId: value || null })}
      daysStart={daysStart}
      onDaysStartChange={setDaysStart}
      view={planView}
      onViewChange={setPlanView}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      {selected =>
        selected ? (
          <PlanView
            key={`${selected.duty._id}:${selected.location._id}`}
            ref={planRef}
            duty={selected.duty}
            location={selected.location}
            startDate={daysStart}
          />
        ) : (
          <Empty description="Select a duty location to see its plan." />
        )
      }
    </PlanSelection>
  );
};

export default List;
