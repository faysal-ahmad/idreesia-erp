import React, { useState } from 'react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  CloseOutlined,
  LeftOutlined,
  LockOutlined,
  PlusOutlined,
  RightOutlined,
  SyncOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { Alert, Button, DatePicker, Empty, Space, Spin } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type { WorkspaceDaPlanDaysQuery } from 'meteor/idreesia-common/types/client-operations';
import { PersonPickerDrawer, type PickerPerson } from '/imports/ui/modules/helpers/controls';

import AttendanceMark, { asStatus } from './attendance-mark';
import { todayInKarachi } from './dates';
import DutySelect from './duty-select';
import { WORKSPACE_DA_PLAN_DAYS, WORKSPACE_DA_SET_DAY_OVERRIDE, daKarkunSource } from './gql';
import { useDuties, useDutiesAttendanceAccess } from './hooks';

const DAY_COUNT = 7;

type PlanDays = NonNullable<WorkspaceDaPlanDaysQuery['workspaceDaPlanDays']>;
type PlanDay = NonNullable<NonNullable<PlanDays['days']>[number]>;

const idsOf = (rows: Array<string | null> | null | undefined) =>
  (rows ?? []).filter((id): id is string => !!id);

// Seven days of a duty's plan. Future days can be changed (add somebody for
// the day, take a member off it); today and earlier are locked, except a
// duty's first day.
const PlanningPage = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const today = todayInKarachi();
  const { duties, loading: dutiesLoading } = useDuties(locationId);
  const { canManageDuties } = useDutiesAttendanceAccess(locationId);
  const [selectedDutyId, setSelectedDutyId] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [addingForDate, setAddingForDate] = useState<string | null>(null);

  const activeDuties = duties.filter(duty => duty.isActive);
  const dutyId = activeDuties.some(duty => duty._id === selectedDutyId)
    ? selectedDutyId
    : (activeDuties[0]?._id ?? '');

  const { data, loading, refetch } = useQuery(WORKSPACE_DA_PLAN_DAYS, {
    variables: { locationId, dutyId, startDate },
    skip: !dutyId,
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const [setDayOverride] = useMutation(WORKSPACE_DA_SET_DAY_OVERRIDE);

  const plan = data?.workspaceDaPlanDays?.startDate === startDate
    ? data.workspaceDaPlanDays
    : undefined;
  const days = (plan?.days ?? []).filter(
    (day): day is PlanDay => day?.date != null
  );

  const saveOverride = (
    date: string,
    addedKarkunIds: string[],
    absentKarkunIds: string[]
  ) => {
    setDayOverride({
      variables: { locationId, dutyId, date, addedKarkunIds, absentKarkunIds },
    })
      .then(() => refetch())
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const handleAddKarkun = (karkun: PickerPerson) => {
    const date = addingForDate;
    setAddingForDate(null);
    const day = days.find(item => item.date === date);
    if (!date || !day) return;
    const added = idsOf(day.addedKarkunIds);
    saveOverride(
      date,
      added.includes(karkun._id) ? added : [...added, karkun._id],
      idsOf(day.absentKarkunIds).filter(id => id !== karkun._id)
    );
  };

  // A person added for the day is taken back off the day.
  const removeAdded = (day: PlanDay, karkunId: string) =>
    saveOverride(
      day.date as string,
      idsOf(day.addedKarkunIds).filter(id => id !== karkunId),
      idsOf(day.absentKarkunIds)
    );

  // A member of the roster is taken off the day, or put back.
  const setOff = (day: PlanDay, karkunId: string, off: boolean) => {
    const absent = idsOf(day.absentKarkunIds).filter(id => id !== karkunId);
    saveOverride(
      day.date as string,
      idsOf(day.addedKarkunIds),
      off ? [...absent, karkunId] : absent
    );
  };

  if (dutiesLoading && duties.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const addingDay = days.find(day => day.date === addingForDate);

  return (
    <div className="da-page">
      <div className="da-selection">
        <Space size={12}>
          <span className="da-select-label">Duty</span>
          <DutySelect
            duties={activeDuties}
            value={dutyId || undefined}
            onChange={setSelectedDutyId}
          />
        </Space>
        <Space size={8}>
          <Button
            icon={<LeftOutlined />}
            title="Previous week"
            onClick={() =>
              setStartDate(dayjs(startDate).subtract(DAY_COUNT, 'day').format('YYYY-MM-DD'))
            }
          />
          <DatePicker
            className="da-date-picker"
            format="DD MMM, YYYY"
            allowClear={false}
            value={dayjs(startDate)}
            onChange={value => {
              if (value) setStartDate(value.format('YYYY-MM-DD'));
            }}
          />
          <Button
            icon={<RightOutlined />}
            title="Next week"
            onClick={() =>
              setStartDate(dayjs(startDate).add(DAY_COUNT, 'day').format('YYYY-MM-DD'))
            }
          />
          <Button
            icon={<SyncOutlined />}
            title="Reload Data"
            loading={loading}
            disabled={!dutyId}
            onClick={() => refetch()}
          />
        </Space>
      </div>

      {activeDuties.length === 0 ? (
        <Empty description="There are no active duties to plan. Add one on the Duties page." />
      ) : (
        <>
          <h3 className="da-range">
            {dayjs(startDate).format('DD MMM, YYYY')} –{' '}
            {dayjs(startDate).add(DAY_COUNT - 1, 'day').format('DD MMM, YYYY')}
          </h3>
          {canManageDuties ? (
            <Alert
              type="info"
              showIcon
              message="Add somebody for a single day, or take a member off a day, on days that have not started (today too, on a duty's first day). To change who is on the duty every week, change its members on the Duties page."
            />
          ) : null}
          {loading && !plan ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Spin />
            </div>
          ) : (
            <div className="da-board">
              {days.map(day => {
                const locked = !!day.locked;
                const editable = canManageDuties && !locked;
                const karkuns = (day.karkuns ?? []).flatMap(karkun =>
                  karkun?.karkunId ? [karkun] : []
                );
                return (
                  <div
                    key={day.date}
                    className={`da-day${day.date === today ? ' is-today' : ''}`}
                  >
                    <div className="da-day-header">
                      <span>
                        {day.dayOfWeek}{' '}
                        <span className="da-day-date">
                          {dayjs(day.date).format('DD MMM')}
                        </span>
                      </span>
                      {locked ? <LockOutlined title="Locked" /> : null}
                    </div>
                    <div className="da-day-body">
                      {karkuns.length === 0 ? (
                        <div className="da-muted">None</div>
                      ) : null}
                      {karkuns.map(karkun => (
                        <div
                          key={karkun.karkunId}
                          className={`da-person${karkun.off ? ' is-off' : ''}${
                            karkun.addedForDay ? ' is-added' : ''
                          }`}
                        >
                          <span className="da-person-name">{karkun.name}</span>
                          {locked ? (
                            <AttendanceMark
                              status={asStatus(karkun.attendance)}
                              editable={false}
                            />
                          ) : null}
                          {editable && karkun.addedForDay ? (
                            <Button
                              type="text"
                              className="da-person-action"
                              icon={<CloseOutlined />}
                              title="Remove from this day"
                              onClick={() => removeAdded(day, karkun.karkunId)}
                            />
                          ) : null}
                          {editable && !karkun.addedForDay ? (
                            <Button
                              type="text"
                              className={`da-person-action${karkun.off ? ' is-restore' : ''}`}
                              icon={karkun.off ? <UndoOutlined /> : <CloseOutlined />}
                              title={karkun.off ? 'Put back on this day' : 'Take off this day'}
                              onClick={() => setOff(day, karkun.karkunId, !karkun.off)}
                            />
                          ) : null}
                        </div>
                      ))}
                      {editable ? (
                        <Button
                          size="small"
                          className="da-add-person"
                          icon={<PlusOutlined />}
                          onClick={() => setAddingForDate(day.date as string)}
                        >
                          Add
                        </Button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <PersonPickerDrawer
        title={
          addingForDate
            ? `Add somebody for ${dayjs(addingForDate).format('DD MMM, YYYY')}`
            : 'Add'
        }
        open={addingForDate != null}
        onClose={() => setAddingForDate(null)}
        source={{ ...daKarkunSource, variables: { locationId } }}
        selectedIds={(addingDay?.karkuns ?? []).flatMap(karkun =>
          karkun?.karkunId && !karkun.off ? [karkun.karkunId] : []
        )}
        selectedLabel="On duty"
        mode="single"
        onPick={handleAddKarkun}
      />
    </div>
  );
};

export default PlanningPage;
