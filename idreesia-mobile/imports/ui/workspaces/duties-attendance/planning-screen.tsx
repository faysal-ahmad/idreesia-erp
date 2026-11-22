import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { ActionSheet, Avatar, List, PullToRefresh, Tag } from 'antd-mobile';
import { AddOutline, LockOutline } from 'antd-mobile-icons';
import { toDeviceUrl } from '/imports/startup/backend';

import type { MobileDaPlanDaysQuery } from 'meteor/idreesia-common/types/client-operations';

import { useOnlineStatus } from '../../hooks';
import { Page, PageEmpty, PageError, PageLoading, showError, showWarning } from '../../layout';
import { useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { AttendanceMark } from './attendance-mark';
import { asStatus } from './attendance-status';
import { addDays, formatLongDate, todayInKarachi } from './dates';
import { DateBar } from './date-bar';
import { DutyBar } from './duty-bar';
import { MOBILE_DA_PLAN_DAYS, MOBILE_DA_SET_DAY_OVERRIDE } from './gql';
import { useDaAccess, useDuties, type Duty } from './hooks';
import { InfoNote } from './info-note';
import { KarkunSearchPopup } from './karkun-search-popup';

type PlanDay = NonNullable<
  NonNullable<NonNullable<MobileDaPlanDaysQuery['workspaceDaPlanDays']>['days']>[number]
>;
type PlanKarkun = NonNullable<NonNullable<PlanDay['karkuns']>[number]>;

const idsOf = (rows: Array<string | null> | null | undefined) => (rows ?? []).filter((id): id is string => !!id);

const rowExtra = (karkun: PlanKarkun, locked: boolean) => {
  if (locked) return <AttendanceMark status={asStatus(karkun.attendance)} />;
  if (karkun.off) return <Tag fill="outline">Off</Tag>;
  if (karkun.addedForDay) {
    return (
      <Tag color="primary" fill="outline">
        Added
      </Tag>
    );
  }
  return undefined;
};

interface SectionProps {
  locationId: string;
  duty: Duty;
  date: string;
  /** The user may change plans (needs the manage permission). */
  canEdit: boolean;
  online: boolean;
  /** Lets the screen's pull-to-refresh reload this section. */
  register: (dutyId: string, refetch: (() => Promise<unknown>) | null) => void;
}

/** One duty's plan for the day: who is on it, and (for a future day) the changes you can make. */
const DutySection = ({ locationId, duty, date, canEdit, online, register }: SectionProps) => {
  const dutyId = duty._id as string;
  const { data, loading, error, refetch } = useQuery(MOBILE_DA_PLAN_DAYS, {
    variables: { locationId, dutyId, startDate: date },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const [setDayOverride] = useMutation(MOBILE_DA_SET_DAY_OVERRIDE);
  const [selected, setSelected] = useState<PlanKarkun | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    register(dutyId, refetch);
    return () => register(dutyId, null);
  }, [dutyId, refetch, register]);

  const plan = data?.workspaceDaPlanDays?.startDate === date ? data.workspaceDaPlanDays : undefined;
  const day = plan?.days?.find((item): item is PlanDay => item?.date === date);
  const karkuns = (day?.karkuns ?? []).filter((karkun): karkun is PlanKarkun => karkun?.karkunId != null);
  const locked = Boolean(day?.locked);
  const editable = canEdit && !locked && day != null;

  const saveOverride = (added: string[], absent: string[]) =>
    setDayOverride({
      variables: { locationId, dutyId, date, addedKarkunIds: added, absentKarkunIds: absent },
    })
      .then(() => refetch())
      .catch(failure => showError(failure, 'Could not change the plan.'));

  const added = idsOf(day?.addedKarkunIds);
  const absent = idsOf(day?.absentKarkunIds);

  const actionFor = (person: PlanKarkun) => {
    if (person.addedForDay) {
      return {
        key: 'remove',
        text: 'Remove from this day',
        danger: true,
        disabled: !online,
        onClick: () => saveOverride(added.filter(id => id !== person.karkunId), absent),
      };
    }
    if (person.off) {
      return {
        key: 'back',
        text: 'Put back on this day',
        disabled: !online,
        onClick: () => saveOverride(added, absent.filter(id => id !== person.karkunId)),
      };
    }
    return {
      key: 'off',
      text: 'Take off this day',
      danger: true,
      disabled: !online,
      onClick: () => saveOverride(added, [...absent, person.karkunId]),
    };
  };

  return (
    <section className="da-day">
      <h3 className="da-day-header">
        <span>{duty.name}</span>
        {locked && <LockOutline aria-label="Locked" />}
        {editable && (
          <button
            aria-label={`Add somebody to ${duty.name} for this day`}
            className="da-day-add"
            type="button"
            onClick={() => (online ? setAdding(true) : showWarning('You are offline. Connect to change the plan.'))}
          >
            <AddOutline />
          </button>
        )}
      </h3>
      <List mode="card">
        {!day && loading && <List.Item className="da-empty-item">Loading…</List.Item>}
        {!day && !loading && error && <List.Item className="da-empty-item">Could not load this duty's plan.</List.Item>}
        {day && karkuns.length === 0 && <List.Item className="da-empty-item">None</List.Item>}
        {karkuns.map(karkun => (
          <List.Item
            key={karkun.karkunId}
            arrowIcon={false}
            className={karkun.off ? 'da-off' : undefined}
            clickable={editable}
            description={[karkun.contactNumber1, karkun.contactNumber2].filter(Boolean).join(' · ') || undefined}
            extra={rowExtra(karkun, locked)}
            prefix={<Avatar src={toDeviceUrl(karkun.imageThumbnailUrl ?? karkun.imageUrl) ?? ''} />}
            onClick={editable ? () => setSelected(karkun) : undefined}
          >
            {karkun.name}
          </List.Item>
        ))}
      </List>
      <ActionSheet
        actions={selected ? [actionFor(selected)] : []}
        cancelText="Cancel"
        extra={selected?.name ?? undefined}
        visible={selected != null}
        onClose={() => setSelected(null)}
      />
      <KarkunSearchPopup
        locationId={locationId}
        selectedIds={karkuns.flatMap(karkun => (karkun.off ? [] : [karkun.karkunId]))}
        selectedLabel="On duty"
        title={`Add to ${duty.name}`}
        visible={adding}
        onClose={() => setAdding(false)}
        onPick={karkun => {
          setAdding(false);
          saveOverride(
            added.includes(karkun._id) ? added : [...added, karkun._id],
            absent.filter(id => id !== karkun._id),
          );
        }}
      />
    </section>
  );
};

/**
 * Workspace → Duties & Attendance → Duty Planning: one day, with a section
 * for each duty (or the one chosen). Future days can be changed (add somebody
 * for the day, take a member off it); today and earlier are locked and show
 * their attendance.
 */
export const PlanningScreen = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const today = todayInKarachi();
  const online = useOnlineStatus();
  const { canManageDuties } = useDaAccess(locationId);
  const { duties, loading, error, refetch } = useDuties(locationId);
  // '' is every duty.
  const [chosenDutyId, setChosenDutyId] = useState('');
  // Opens on tomorrow, the first day that can still be changed.
  const [date, setDate] = useState(() => addDays(today, 1));

  const activeDuties = duties.filter(duty => duty.isActive);
  const dutyId = activeDuties.some(duty => duty._id === chosenDutyId) ? chosenDutyId : '';
  const shown = dutyId ? activeDuties.filter(duty => duty._id === dutyId) : activeDuties;

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
  } else if (activeDuties.length === 0) {
    content = <PageEmpty description="Add one on the Duties page." title="No active duties to plan" />;
  } else {
    content = (
      <PullToRefresh onRefresh={refresh}>
        {canManageDuties && date > today && (
          <InfoNote>
            Tap a person to take them off this day, or add somebody for it. To change who is on a duty every week,
            change its members on the Duties page.
          </InfoNote>
        )}
        {date <= today && (
          <InfoNote>
            {date === today ? 'Today' : 'This day'} is locked: the list is fixed and shows attendance.
            {canManageDuties ? ' Go to a later day to add or remove people.' : ''}
          </InfoNote>
        )}
        {shown.map(duty => (
          <DutySection
            key={duty._id}
            canEdit={canManageDuties}
            online={online}
            date={date}
            duty={duty}
            locationId={locationId}
            register={register}
          />
        ))}
      </PullToRefresh>
    );
  }

  return (
    <Page backTo={WorkspacesPaths.root} title="Duty Planning">
      {activeDuties.length > 0 && (
        <>
          <DutyBar allLabel="All duties" duties={activeDuties} value={dutyId} onChange={setChosenDutyId} />
          <DateBar
            label={formatLongDate(date)}
            precision="day"
            stepLabel="day"
            value={date}
            onPick={setDate}
            onStep={direction => setDate(current => addDays(current, direction))}
          />
        </>
      )}
      {content}
    </Page>
  );
};
