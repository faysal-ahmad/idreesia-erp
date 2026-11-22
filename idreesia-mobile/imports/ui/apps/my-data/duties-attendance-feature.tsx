import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { ActionSheet, List, PullToRefresh, Tag } from 'antd-mobile';
import type { Action } from 'antd-mobile/es/components/action-sheet';
import { ModulePaths } from 'meteor/idreesia-common/constants';

import { useCurrentUser, useOnlineStatus } from '../../hooks';
import { Page, PageError, PageLoading, showError, showSuccess } from '../../layout';
import { getCurrentLocation } from '../../utilities';
import { ATTENDANCE_STATUSES, type AttendanceStatus } from '../../workspaces/duties-attendance/attendance-status';
import { DateBar } from '../../workspaces/duties-attendance/date-bar';
import { addDays, formatLongDate, todayInKarachi } from '../../workspaces/duties-attendance/dates';
import { MOBILE_DA_MY_DUTIES, MOBILE_DA_SET_ATTENDANCE } from '../../workspaces/duties-attendance/gql';

/** How the day's attendance was marked; nothing when unmarked (or the day hasn't come yet). */
const attendanceTag = (attendance?: string | null) => {
  if (attendance === 'present') return <Tag color="success" fill="outline">Present</Tag>;
  if (attendance === 'late') return <Tag color="warning" fill="outline">Late</Tag>;
  if (attendance === 'absent') return <Tag color="danger" fill="outline">Absent</Tag>;
  return undefined;
};

/**
 * My Data → Duties & Attendance: the user's own duties for one day. Step
 * back to see past days with their attendance, or forward to see the schedule.
 */
export const DutiesAttendanceFeature = () => {
  const today = todayInKarachi();
  const [date, setDate] = useState(today);
  const { data, loading, error, refetch } = useQuery(MOBILE_DA_MY_DUTIES, {
    variables: { date },
    fetchPolicy: 'cache-and-network',
  });
  const duties = (data?.myDuties ?? []).filter(duty => duty != null);
  const online = useOnlineStatus();
  const { user } = useCurrentUser();
  const [setAttendance] = useMutation(MOBILE_DA_SET_ATTENDANCE);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  // The duty whose attendance options are showing.
  const [optionsFor, setOptionsFor] = useState<(typeof duties)[number] | null>(null);

  // Marks the user's own attendance, with where they are. Today only, and
  // once: to change it, unmark it first (see unmarkOwn).
  const markOwn = async (duty: (typeof duties)[number], status: AttendanceStatus) => {
    const key = `${duty.locationId}-${duty.dutyId}`;
    setSavingKey(key);
    try {
      const geo = await getCurrentLocation();
      const karkunId = user?.karkun?._id;
      if (!karkunId) throw new Error('Your account is not linked to a karkun.');
      await setAttendance({
        variables: {
          locationId: duty.locationId,
          dutyId: duty.dutyId,
          date: duty.date,
          karkunId,
          status,
          geo,
        },
      });
      showSuccess('Attendance marked');
      await refetch();
    } catch (failure) {
      showError(failure, 'Could not save the attendance.');
    } finally {
      setSavingKey(null);
    }
  };

  // Takes back a mark the user made themselves, e.g. one picked by mistake.
  const unmarkOwn = async (duty: (typeof duties)[number]) => {
    const key = `${duty.locationId}-${duty.dutyId}`;
    setSavingKey(key);
    try {
      const karkunId = user?.karkun?._id;
      if (!karkunId) throw new Error('Your account is not linked to a karkun.');
      await setAttendance({
        variables: {
          locationId: duty.locationId,
          dutyId: duty.dutyId,
          date: duty.date,
          karkunId,
          status: null,
        },
      });
      showSuccess('Attendance removed');
      await refetch();
    } catch (failure) {
      showError(failure, 'Could not remove the attendance.');
    } finally {
      setSavingKey(null);
    }
  };

  // Today's own attendance can be marked, or taken back if the user marked it.
  const isActionable = (duty: (typeof duties)[number]) =>
    duty.canMarkOwnAttendance &&
    duty.date === today &&
    online &&
    savingKey == null &&
    (!duty.attendance || duty.attendanceSource === 'self');

  const optionActions = (duty: (typeof duties)[number]): Action[] =>
    duty.attendance
      ? [
          {
            key: 'remove',
            text: 'Remove my attendance',
            danger: true,
            onClick: () => unmarkOwn(duty),
          },
        ]
      : ATTENDANCE_STATUSES.map(item => ({
          key: item.status,
          text: `Mark me ${item.label}`,
          onClick: () => markOwn(duty, item.status),
        }));

  let content;
  if (!data && loading) {
    content = <PageLoading />;
  } else if (!data && error) {
    content = <PageError error={error} onRetry={() => refetch()} />;
  } else {
    content = (
      <PullToRefresh onRefresh={() => refetch().then(() => undefined, () => undefined)}>
        <List mode="card">
          {duties.length === 0 ? (
            <List.Item className="workspaces-empty-item">No duties on this day</List.Item>
          ) : (
            duties.map(duty => (
              <List.Item
                key={`${duty.locationId}-${duty.dutyId}`}
                className="home-item"
                description={duty.locationName}
                arrowIcon={isActionable(duty)}
                extra={attendanceTag(duty.attendance)}
                onClick={isActionable(duty) ? () => setOptionsFor(duty) : undefined}
              >
                {duty.dutyName}
              </List.Item>
            ))
          )}
        </List>
      </PullToRefresh>
    );
  }

  return (
    <Page backTo={ModulePaths.myData} title="Duties & Attendance">
      <DateBar
        label={formatLongDate(date)}
        precision="day"
        stepLabel="day"
        value={date}
        onPick={setDate}
        onStep={direction => setDate(current => addDays(current, direction))}
      />
      {content}
      <ActionSheet
        actions={optionsFor ? optionActions(optionsFor) : []}
        cancelText="Cancel"
        extra={optionsFor ? `${optionsFor.dutyName} · ${optionsFor.locationName}` : undefined}
        visible={optionsFor != null}
        onAction={() => setOptionsFor(null)}
        onClose={() => setOptionsFor(null)}
      />
    </Page>
  );
};
