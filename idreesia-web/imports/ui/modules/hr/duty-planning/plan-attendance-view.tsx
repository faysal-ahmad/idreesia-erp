import React, { useImperativeHandle, useState } from 'react';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@apollo/client/react';
import { Alert } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type { DutyPlanDaysQuery } from 'meteor/idreesia-common/types/client-operations';

import AttendanceBoard, { type AttendanceStatus } from './attendance-board';
import { DUTY_PLAN_DAYS, SET_DUTY_ATTENDANCE } from './gql';
import type { PlanDuty, PlanLocation, PlanWeeklyViewHandle } from './plan-weekly-view';

interface Props {
  duty: PlanDuty;
  location: PlanLocation;
  startDate: string;
  dayCount?: number;
  showImages?: boolean;
}

type DaysResult = NonNullable<DutyPlanDaysQuery['dutyPlanDays']>;
type DayCard = NonNullable<NonNullable<DaysResult['days']>[number]> & {
  date: string;
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '';

const PlanAttendanceView = React.forwardRef<PlanWeeklyViewHandle, Props>(
  ({ duty, location, startDate, dayCount = 7, showImages = false }, ref) => {
    const [savingKey, setSavingKey] = useState<string>();
    const planKey = { dutyId: duty._id, locationId: location._id };
    const {
      data: daysData,
      loading: daysLoading,
      refetch: refetchDays,
    } = useQuery(DUTY_PLAN_DAYS, {
      variables: { ...planKey, startDate },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    });
    const [setAttendance] = useMutation(SET_DUTY_ATTENDANCE);

    const daysView =
      daysData?.dutyPlanDays?.startDate === startDate
        ? daysData.dutyPlanDays
        : undefined;
    const assignmentDays = (daysView?.days ?? [])
      .filter((day): day is DayCard => !!day?.date)
      .slice(0, dayCount);

    const refresh = () => refetchDays();
    useImperativeHandle(ref, () => ({ refresh }), [refetchDays]);

    const reportError = (error: unknown) => {
      const text = errorMessage(error);
      if (text) message.error(text, 5);
    };

    const handleChangeStatus = (
      shiftId: string,
      date: string,
      karkunId: string,
      status: AttendanceStatus | null
    ) => {
      const key = `${date}:${shiftId}:${karkunId}`;
      setSavingKey(key);
      setAttendance({
        variables: {
          ...planKey,
          shiftId,
          date,
          karkunId,
          status,
        },
      })
        .then(() => refetchDays())
        .catch(reportError)
        .finally(() => setSavingKey(undefined));
    };

    const hasSlots = assignmentDays.some(day =>
      (day.slots ?? []).some(slot => slot?.shiftId)
    );

    return (
      <div className="duty-roster-page">
        <h3 className="duty-roster-range">
          {dayjs(startDate).format('DD MMM, YYYY')} –{' '}
          {dayjs(startDate).add(dayCount - 1, 'day').format('DD MMM, YYYY')}
        </h3>
        {!daysLoading && daysView && !hasSlots ? (
          <Alert
            type="info"
            showIcon
            message="This duty has no shifts yet. Add shifts on the duty before recording attendance."
          />
        ) : null}
        <AttendanceBoard
          columns={dayCount}
          showImages={showImages}
          loading={daysLoading && !daysView}
          days={assignmentDays}
          savingKey={savingKey}
          onChangeStatus={handleChangeStatus}
        />
      </div>
    );
  }
);

export default PlanAttendanceView;
