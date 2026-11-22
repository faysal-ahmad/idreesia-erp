import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Avatar, List, PullToRefresh, Tag } from 'antd-mobile';
import { toDeviceUrl } from '/imports/startup/backend';

import type { MobileDaPlanDaysQuery } from 'meteor/idreesia-common/types/client-operations';

import { useOnlineStatus } from '../../hooks';
import { Page, PageEmpty, PageError, PageLoading, showError } from '../../layout';
import { useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { AttendanceMark } from './attendance-mark';
import { asStatus, type AttendanceStatus } from './attendance-status';
import { addDays, formatLongDate, todayInKarachi } from './dates';
import { DateBar } from './date-bar';
import { DutyBar } from './duty-bar';
import { MOBILE_DA_PLAN_DAYS, MOBILE_DA_SET_ATTENDANCE } from './gql';
import { useDaAccess, useDuties, type Duty } from './hooks';

type PlanKarkun = NonNullable<
  NonNullable<
    NonNullable<NonNullable<MobileDaPlanDaysQuery['workspaceDaPlanDays']>['days']>[number]
  >['karkuns']
>[number] &
  object;

interface SectionProps {
  locationId: string;
  duty: Duty;
  date: string;
  canMarkAttendance: boolean;
  online: boolean;
  /** Lets the screen's pull-to-refresh reload this section. */
  register: (dutyId: string, refetch: (() => Promise<unknown>) | null) => void;
}

/** One duty's attendance for the day. */
const DutySection = ({ locationId, duty, date, canMarkAttendance, online, register }: SectionProps) => {
  const dutyId = duty._id as string;
  const [savingKarkunId, setSavingKarkunId] = useState<string | null>(null);
  const { data, loading, error, refetch } = useQuery(MOBILE_DA_PLAN_DAYS, {
    variables: { locationId, dutyId, startDate: date },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const [setAttendance] = useMutation(MOBILE_DA_SET_ATTENDANCE);

  useEffect(() => {
    register(dutyId, refetch);
    return () => register(dutyId, null);
  }, [dutyId, refetch, register]);

  const day =
    data?.workspaceDaPlanDays?.startDate === date
      ? data.workspaceDaPlanDays.days?.find(item => item?.date === date)
      : undefined;
  const karkuns = (day?.karkuns ?? []).filter((karkun): karkun is PlanKarkun => karkun?.karkunId != null);

  const mark = (karkunId: string, status: AttendanceStatus | null) => {
    setSavingKarkunId(karkunId);
    setAttendance({ variables: { locationId, dutyId, date, karkunId, status } })
      .then(() => refetch())
      .catch(failure => showError(failure, 'Could not save the attendance.'))
      .finally(() => setSavingKarkunId(null));
  };

  return (
    <section className="da-day">
      <h3 className="da-day-header">
        <span>{duty.isActive ? duty.name : `${duty.name} (inactive)`}</span>
      </h3>
      <List mode="card">
        {!day && loading && <List.Item className="da-empty-item">Loading…</List.Item>}
        {!day && !loading && error && <List.Item className="da-empty-item">Could not load this duty's attendance.</List.Item>}
        {day && karkuns.length === 0 && <List.Item className="da-empty-item">Nobody was on duty on this day</List.Item>}
        {karkuns.map(karkun => (
          <List.Item
            key={karkun.karkunId}
            arrowIcon={false}
            extra={
              <AttendanceMark
                disabled={!online || savingKarkunId === karkun.karkunId}
                status={asStatus(karkun.attendance)}
                onChange={canMarkAttendance ? status => mark(karkun.karkunId, status) : undefined}
              />
            }
            prefix={<Avatar src={toDeviceUrl(karkun.imageThumbnailUrl ?? karkun.imageUrl) ?? ''} />}
          >
            {karkun.name}
            {karkun.addedForDay && (
              <Tag className="da-added-tag" fill="outline">
                Added for the day
              </Tag>
            )}
          </List.Item>
        ))}
      </List>
    </section>
  );
};

/**
 * Workspace → Duties & Attendance → Duty Attendance: marks who was present,
 * late or absent, for today or an earlier day. One section per duty (all the
 * active ones, or the one chosen).
 */
export const AttendanceScreen = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const today = todayInKarachi();
  const online = useOnlineStatus();
  const { canMarkAttendance } = useDaAccess(locationId);
  const { duties, loading, error, refetch } = useDuties(locationId);
  // '' is every active duty.
  const [chosenDutyId, setChosenDutyId] = useState('');
  const [date, setDate] = useState(today);

  // A retired duty can still have days to mark, so it can be chosen on its own.
  const dutyId = duties.some(duty => duty._id === chosenDutyId) ? chosenDutyId : '';
  const shown = dutyId ? duties.filter(duty => duty._id === dutyId) : duties.filter(duty => duty.isActive);

  const refetchers = useRef(new Map<string, () => Promise<unknown>>());
  const register = useRef((id: string, fn: (() => Promise<unknown>) | null) => {
    if (fn) refetchers.current.set(id, fn);
    else refetchers.current.delete(id);
  }).current;
  const refresh = () =>
    Promise.all([refetch(), ...Array.from(refetchers.current.values()).map(fn => fn())]).then(
      () => undefined,
      () => undefined,
    );

  let content;
  if (loading) {
    content = <PageLoading />;
  } else if (error) {
    content = <PageError error={error} onRetry={refresh} />;
  } else if (duties.length === 0) {
    content = <PageEmpty description="Add one on the Duties page." title="No duties yet" />;
  } else if (shown.length === 0) {
    content = <PageEmpty description="Choose a retired duty above to see its days." title="No active duties" />;
  } else {
    content = (
      <PullToRefresh onRefresh={refresh}>
        {shown.map(duty => (
          <DutySection
            key={duty._id}
            canMarkAttendance={canMarkAttendance}
            date={date}
            duty={duty}
            locationId={locationId}
            online={online}
            register={register}
          />
        ))}
      </PullToRefresh>
    );
  }

  return (
    <Page backTo={WorkspacesPaths.root} title="Duty Attendance">
      {duties.length > 0 && (
        <>
          <DutyBar allLabel="All duties" duties={duties} value={dutyId} onChange={setChosenDutyId} />
          <DateBar
            disableNext={date >= today}
            label={formatLongDate(date)}
            max={today}
            precision="day"
            stepLabel="day"
            value={date}
            onPick={setDate}
            onStep={direction => setDate(current => (direction > 0 && current >= today ? current : addDays(current, direction)))}
          />
        </>
      )}
      {content}
    </Page>
  );
};
