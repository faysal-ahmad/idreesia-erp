import React, { useImperativeHandle, useState } from 'react';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@apollo/client/react';
import { Alert, Drawer, Spin } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type {
  DutyPlanDaysQuery,
  DutyPlanTeamsQuery,
  DutyPlanWeekQuery,
} from 'meteor/idreesia-common/types/client-operations';
import KarkunsSelectionList from '/imports/ui/modules/hr/karkuns/field/list-container';

import {
  DUTY_PLAN_DAYS,
  DUTY_PLAN_TEAMS,
  DUTY_PLAN_WEEK,
  SET_DUTY_DAY_OVERRIDE,
  SET_DUTY_SHIFT_TEAM,
} from './gql';
import SlotModal from './edit/slot-modal';
import WeekView from './edit/week-view';

export interface PlanDuty {
  _id: string;
  name: string;
}

export interface PlanLocation {
  _id: string;
  name: string;
}

interface Props {
  duty: PlanDuty;
  location: PlanLocation;
  startDate: string;
  dayCount?: number;
  showImages?: boolean;
}

export interface PlanWeeklyViewHandle {
  refresh: () => Promise<unknown>;
}

type WeekData = NonNullable<DutyPlanWeekQuery['dutyPlanWeek']>;
type WeekShift = NonNullable<NonNullable<WeekData['shifts']>[number]>;
type WeekSlot = NonNullable<NonNullable<WeekData['slots']>[number]>;
type TeamOption = NonNullable<
  NonNullable<DutyPlanTeamsQuery['allTeams']>[number]
>;

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '';

const idsOf = (rows: Array<string | null> | null | undefined) =>
  (rows ?? []).filter((id): id is string => !!id);

type DaysResult = NonNullable<DutyPlanDaysQuery['dutyPlanDays']>;
type DayCard = NonNullable<NonNullable<DaysResult['days']>[number]> & {
  date: string;
};

const PlanWeeklyView = React.forwardRef<PlanWeeklyViewHandle, Props>(
  ({ duty, location, startDate, dayCount = 7, showImages = false }, ref) => {
    const [editingShift, setEditingShift] = useState<{
      shiftId: string;
      shiftName: string;
    } | null>(null);
    const [addingFor, setAddingFor] = useState<{
      shiftId: string;
      date: string;
    } | null>(null);

    const planKey = { dutyId: duty._id, locationId: location._id };
    const { data, loading, refetch } = useQuery(DUTY_PLAN_WEEK, {
      variables: planKey,
      fetchPolicy: 'cache-and-network',
    });
    const {
      data: daysData,
      loading: daysLoading,
      refetch: refetchDays,
    } = useQuery(DUTY_PLAN_DAYS, {
      variables: { ...planKey, startDate },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    });
    const { data: teamsData } = useQuery(DUTY_PLAN_TEAMS, {
      fetchPolicy: 'cache-and-network',
    });
    const [setShiftTeam, { loading: savingSlot }] = useMutation(
      SET_DUTY_SHIFT_TEAM
    );
    const [setDayOverride] = useMutation(SET_DUTY_DAY_OVERRIDE);

    const week = data?.dutyPlanWeek;
    const shifts = (week?.shifts ?? []).filter(
      (shift): shift is WeekShift & { _id: string; name: string } =>
        shift?._id != null && shift.name != null
    );
    const slots = (week?.slots ?? []).filter(
      (slot): slot is WeekSlot & { shiftId: string } => slot?.shiftId != null
    );
    const teams = ((teamsData?.allTeams ?? []).filter(
      (team): team is TeamOption & { _id: string; name: string } =>
        team?._id != null && team.name != null && team.dutyId === duty._id
    )) as Array<TeamOption & { _id: string; name: string }>;

    const reportError = (error: unknown) => {
      const text = errorMessage(error);
      if (text) message.error(text, 5);
    };

    const daysView =
      daysData?.dutyPlanDays?.startDate === startDate
        ? daysData.dutyPlanDays
        : undefined;
    const assignmentDays = (daysView?.days ?? [])
      .filter((day): day is DayCard => !!day?.date)
      .slice(0, dayCount);

    const refresh = () => Promise.all([refetch(), refetchDays()]);
    useImperativeHandle(ref, () => ({ refresh }), [refetch, refetchDays]);

    const saveOverride = (
      shiftId: string,
      date: string,
      addedKarkunIds: string[],
      absentKarkunIds: string[]
    ) => {
      setDayOverride({
        variables: {
          ...planKey,
          shiftId,
          date,
          addedKarkunIds,
          absentKarkunIds,
        },
      })
        .then(() => refetchDays())
        .catch(reportError);
    };

    if (loading && !data) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Spin size="large" />
        </div>
      );
    }

    const editingAssignment = editingShift
      ? slots.find(slot => slot.shiftId === editingShift.shiftId)
      : undefined;

    return (
      <div className="duty-roster-page">
        <h3 className="duty-roster-range">
          {dayjs(startDate).format('DD MMM, YYYY')} –{' '}
          {dayjs(startDate).add(dayCount - 1, 'day').format('DD MMM, YYYY')}
        </h3>
        {shifts.length === 0 ? (
          <Alert
            type="info"
            showIcon
            message="This duty has no shifts yet. Add shifts on the duty before planning it."
          />
        ) : null}

        <WeekView
          columns={dayCount}
          showImages={showImages}
          loading={daysLoading && !daysView}
          days={assignmentDays}
          onSetTeam={setEditingShift}
          onAddKarkun={(shiftId, date) => setAddingFor({ shiftId, date })}
          onChangeOverride={saveOverride}
        />

        <SlotModal
          open={editingShift != null}
          shiftName={editingShift?.shiftName ?? ''}
          teams={teams.map(team => ({
            _id: team._id,
            name: team.name,
            color: team.color,
          }))}
          teamId={editingAssignment?.teamId}
          confirmLoading={savingSlot}
          onCancel={() => setEditingShift(null)}
          onSave={teamId => {
            if (!editingShift) return;
            setShiftTeam({
              variables: {
                ...planKey,
                shiftId: editingShift.shiftId,
                teamId,
              },
            })
              .then(() => {
                message.success('Team saved. The change applies from tomorrow.', 3);
                setEditingShift(null);
                return refresh();
              })
              .catch(reportError);
          }}
        />

        <Drawer
          title="Select a Karkun"
          width={800}
          onClose={() => setAddingFor(null)}
          open={addingFor != null}
          destroyOnHidden
        >
          <KarkunsSelectionList
            setSelectedValue={karkun => {
              const shiftId = addingFor?.shiftId;
              const date = addingFor?.date;
              const karkunId = karkun._id;
              setAddingFor(null);
              if (!shiftId || !date || !karkunId) return;
              const slot = assignmentDays
                .find(item => item.date === date)
                ?.slots?.find(item => item?.shiftId === shiftId);
              const addedKarkunIds = idsOf(slot?.addedKarkunIds);
              const absentKarkunIds = idsOf(slot?.absentKarkunIds).filter(
                id => id !== karkunId
              );
              saveOverride(
                shiftId,
                date,
                addedKarkunIds.includes(karkunId)
                  ? addedKarkunIds
                  : [...addedKarkunIds, karkunId],
                absentKarkunIds
              );
            }}
          />
        </Drawer>
      </div>
    );
  }
);

export default PlanWeeklyView;
