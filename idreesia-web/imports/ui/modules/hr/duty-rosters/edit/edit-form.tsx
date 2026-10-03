import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useMutation, useQuery } from '@apollo/client/react';
import { type RouteComponentProps } from 'react-router';
import {
  Alert,
  Button,
  Drawer,
  Empty,
  Popconfirm,
  Space,
  Spin,
  Tag,
} from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { message } from '/imports/ui/antd-feedback';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type {
  DutyRosterDaysQuery,
  DutyRosterTeamsQuery,
  DutyRosterWeekQuery,
} from 'meteor/idreesia-common/types/client-operations';
import KarkunsSelectionList from '/imports/ui/modules/hr/karkuns/field/list-container';

import { default as paths } from '../../submodule-paths';
import { todayInKarachi } from '../dates';
import {
  ARCHIVE_DUTY_ROSTER,
  DUTY_ROSTER_DAYS,
  DUTY_ROSTER_TEAMS,
  DUTY_ROSTER_WEEK,
  SET_DUTY_ROSTER_DAY_OVERRIDE,
  SET_DUTY_ROSTER_SHIFT_TEAM,
} from '../gql';
import WeekView from './week-view';
import SlotModal from './slot-modal';

type Props = RouteComponentProps<{ rosterId: string }>;

type WeekData = NonNullable<DutyRosterWeekQuery['dutyRosterWeek']>;
type WeekShift = NonNullable<NonNullable<WeekData['shifts']>[number]>;
type WeekSlot = NonNullable<NonNullable<WeekData['slots']>[number]>;
type TeamOption = NonNullable<
  NonNullable<DutyRosterTeamsQuery['allTeams']>[number]
>;

const formatRosterDate = (value?: string | null) =>
  value ? dayjs(value).format('DD MMM, YYYY') : '';

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : '';

const idsOf = (rows: Array<string | null> | null | undefined) =>
  (rows ?? []).filter((id): id is string => !!id);

type DaysResult = NonNullable<DutyRosterDaysQuery['dutyRosterDays']>;
type DayCard = NonNullable<NonNullable<DaysResult['days']>[number]> & {
  date: string;
};

const shiftDate = (date: string, days: number) =>
  dayjs(date).add(days, 'day').format('YYYY-MM-DD');

const EditForm = ({ history, match }: Props) => {
  const rosterId = match.params.rosterId;
  const [daysStart, setDaysStart] = useState(todayInKarachi());
  const [editingShift, setEditingShift] = useState<{
    shiftId: string;
    shiftName: string;
  } | null>(null);
  const [addingFor, setAddingFor] = useState<{
    shiftId: string;
    date: string;
  } | null>(null);

  const { data, loading, refetch } = useQuery(DUTY_ROSTER_WEEK, {
    variables: { rosterId },
    fetchPolicy: 'cache-and-network',
  });
  const {
    data: daysData,
    loading: daysLoading,
    refetch: refetchDays,
  } = useQuery(DUTY_ROSTER_DAYS, {
    variables: { rosterId, startDate: daysStart },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const { data: teamsData } = useQuery(DUTY_ROSTER_TEAMS, {
    fetchPolicy: 'cache-and-network',
  });
  const [archiveDutyRoster, { loading: archiving }] = useMutation(ARCHIVE_DUTY_ROSTER);
  const [setShiftTeam, { loading: savingSlot }] = useMutation(
    SET_DUTY_ROSTER_SHIFT_TEAM
  );
  const [setDayOverride] = useMutation(SET_DUTY_ROSTER_DAY_OVERRIDE);

  const week = data?.dutyRosterWeek;
  const roster = week?.roster;
  const shifts = (week?.shifts ?? []).filter(
    (shift): shift is WeekShift & { _id: string; name: string } =>
      shift?._id != null && shift.name != null
  );
  const slots = (week?.slots ?? []).filter(
    (slot): slot is WeekSlot & { shiftId: string } => slot?.shiftId != null
  );
  const teams = ((teamsData?.allTeams ?? []).filter(
    (team): team is TeamOption & { _id: string; name: string } =>
      team?._id != null && team.name != null && team.dutyId === roster?.dutyId
  )) as Array<TeamOption & { _id: string; name: string }>;

  const rosterLabel = roster
    ? `${roster.duty?.name ?? 'Roster'} · ${roster.location?.name ?? ''}`
    : 'Duty Roster';
  useDynamicBreadcrumbs(['HR', 'Duty Rosters', rosterLabel]);

  const reportError = (error: unknown) => {
    const text = errorMessage(error);
    if (text) message.error(text, 5);
  };

  const daysView =
    daysData?.dutyRosterDays?.startDate === daysStart
      ? daysData.dutyRosterDays
      : undefined;
  const assignmentDays = (daysView?.days ?? []).filter(
    (day): day is DayCard => !!day?.date
  );

  const refresh = () => Promise.all([refetch(), refetchDays()]);

  const handleArchive = () => {
    archiveDutyRoster({ variables: { id: rosterId } })
      .then(() => {
        message.success('Roster archived', 2);
        return refetch();
      })
      .catch(reportError);
  };

  const active = roster?.status === 'active';

  const saveOverride = (
    shiftId: string,
    date: string,
    addedKarkunIds: string[],
    absentKarkunIds: string[]
  ) => {
    setDayOverride({
      variables: {
        rosterId,
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

  if (!roster) {
    return <Empty description="Duty roster not found" />;
  }

  const editingAssignment = editingShift
    ? slots.find(slot => slot.shiftId === editingShift.shiftId)
    : undefined;

  return (
    <div className="duty-roster-page">
      <div className="duty-roster-header">
        <div>
          <h2 className="duty-roster-title">{rosterLabel}</h2>
          <Space size={8} wrap>
            {active ? <Tag color="green">Active</Tag> : <Tag>Archived</Tag>}
            <span>
              {formatRosterDate(roster.startDate)}
              {roster.endDate ? ` – ${formatRosterDate(roster.endDate)}` : ''}
            </span>
          </Space>
        </div>
        <Space>
          <Button
            icon={<SyncOutlined />}
            title="Reload Data"
            loading={daysLoading && !!daysView}
            onClick={() => {
              Promise.all([refetch(), refetchDays()]).catch(reportError);
            }}
          />
          <Button onClick={() => history.push(paths.dutyRostersPath)}>Back</Button>
          {active ? (
            <Popconfirm
              title="Archive this roster? It stays on record and can no longer be edited."
              onConfirm={handleArchive}
              okText="Archive"
              cancelText="Cancel"
            >
              <Button danger loading={archiving}>
                Archive
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      </div>

      {shifts.length === 0 ? (
        <Alert
          type="info"
          showIcon
          message="This duty has no shifts yet. Add shifts on the duty before assigning this roster."
        />
      ) : null}

      <WeekView
        startDate={daysStart}
        loading={daysLoading && !daysView}
        days={assignmentDays}
        editable={!!active}
        onShift={days => setDaysStart(current => shiftDate(current, days))}
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
              rosterId,
              shiftId: editingShift.shiftId,
              teamId,
            },
          })
            .then(() => {
              message.success('Assignment saved', 2);
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
};

export default EditForm;
