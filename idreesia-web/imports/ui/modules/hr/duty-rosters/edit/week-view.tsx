import React from 'react';
import dayjs from 'dayjs';
import { Button, Dropdown, Spin } from 'antd';
import { CheckOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons';

import type { DutyRosterDaysQuery } from 'meteor/idreesia-common/types/client-operations';

import { todayInKarachi } from '../dates';

type DaysResult = NonNullable<DutyRosterDaysQuery['dutyRosterDays']>;
type DayCard = NonNullable<NonNullable<DaysResult['days']>[number]> & {
  date: string;
};

interface WeekViewProps {
  startDate: string;
  loading: boolean;
  days: DayCard[];
  editable: boolean;
  onShift: (days: number) => void;
  onSetTeam: (shift: { shiftId: string; shiftName: string }) => void;
  onAddKarkun: (shiftId: string, date: string) => void;
  onChangeOverride: (
    shiftId: string,
    date: string,
    addedKarkunIds: string[],
    absentKarkunIds: string[]
  ) => void;
}

const idsOf = (ids: Array<string | null> | null | undefined) =>
  (ids ?? []).filter((id): id is string => !!id);

const PersonAction = ({
  name,
  restore,
  onClick,
}: {
  name: string;
  restore: boolean;
  onClick?: () => void;
}) => {
  if (!onClick) return <span className="duty-roster-person-remove" />;
  return (
    <Button
      type="text"
      size="small"
      className={`duty-roster-person-remove${restore ? ' is-restore' : ''}`}
      icon={restore ? <CheckOutlined /> : <CloseOutlined />}
      aria-label={restore ? `Add ${name} back` : `Remove ${name}`}
      onClick={onClick}
    />
  );
};

const PersonRow = ({
  name,
  member,
  off,
  showAction,
  onAction,
}: {
  name: string;
  member: boolean;
  off: boolean;
  showAction: boolean;
  onAction?: () => void;
}) => (
  <div
    className={`duty-roster-calendar-person${
      member ? ' duty-roster-calendar-team-member' : ''
    }${off ? ' is-off' : ''}`}
  >
    <span className="duty-roster-calendar-person-name">
      {member && off ? (
        <CloseOutlined className="duty-roster-off-mark" aria-hidden />
      ) : null}
      {name}
    </span>
    {showAction ? (
      <PersonAction name={name} restore={off} onClick={onAction} />
    ) : null}
  </div>
);

const WeekView = ({
  startDate,
  loading,
  days,
  editable,
  onShift,
  onSetTeam,
  onAddKarkun,
  onChangeOverride,
}: WeekViewProps) => {
  const today = todayInKarachi();
  const lastDate = days[days.length - 1]?.date;
  const rangeLabel = lastDate
    ? `${dayjs(startDate).format('DD MMM, YYYY')} – ${dayjs(lastDate).format('DD MMM, YYYY')}`
    : '';

  return (
    <div className="duty-roster-day">
      <div className="duty-roster-days-header">
        <Button onClick={() => onShift(-7)}>Previous</Button>
        <h3>{rangeLabel}</h3>
        <Button onClick={() => onShift(7)}>Next</Button>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Spin />
        </div>
      ) : (
        <div className="duty-roster-days-board">
          {days.map(day => (
            <div
              key={day.date}
              className={`duty-roster-days-column${day.date === today ? ' is-today' : ''}`}
            >
              <div className="duty-roster-days-date">
                {day.dayOfWeek}
                <span className="duty-roster-days-weekday">
                  {dayjs(day.date).format('DD MMM')}
                </span>
              </div>
              {!day.inRange ? (
                <div className="duty-roster-muted">Outside roster</div>
              ) : (
                (day.slots ?? []).map(slot => {
                  if (!slot?.shiftId) return null;
                  const teamKarkuns = (slot.teamKarkuns ?? []).flatMap(karkun =>
                    karkun?.karkunId
                      ? [
                          {
                            karkunId: karkun.karkunId,
                            name: karkun.name,
                            off: !!karkun.off,
                          },
                        ]
                      : []
                  );
                  const addedKarkuns = (slot.addedKarkuns ?? []).flatMap(karkun =>
                    karkun?.karkunId
                      ? [{ karkunId: karkun.karkunId, name: karkun.name }]
                      : []
                  );
                  const canEditDay = editable && day.date >= today;
                  const addedKarkunIds = idsOf(slot.addedKarkunIds);
                  const absentKarkunIds = idsOf(slot.absentKarkunIds);
                  return (
                    <div key={slot.shiftId} className="duty-roster-calendar-shift">
                      <div className="duty-roster-calendar-shift-name">
                        <span>{slot.shiftName}</span>
                        {editable ? (
                          <Dropdown
                            trigger={['click']}
                            menu={{
                              items: [
                                { key: 'team', label: 'Set recurring team' },
                                {
                                  key: 'karkun',
                                  label: 'Add karkun directly',
                                  disabled: !canEditDay,
                                },
                              ],
                              onClick: ({ key }) => {
                                if (key === 'team') {
                                  onSetTeam({
                                    shiftId: slot.shiftId as string,
                                    shiftName: slot.shiftName ?? '',
                                  });
                                }
                                if (key === 'karkun' && canEditDay) {
                                  onAddKarkun(slot.shiftId as string, day.date);
                                }
                              },
                            }}
                          >
                            <Button
                              type="text"
                              size="small"
                              className="duty-roster-shift-actions"
                              icon={<SettingOutlined />}
                              aria-label="Shift actions"
                            />
                          </Dropdown>
                        ) : null}
                      </div>
                      {slot.teamName ? (
                        <div className="duty-roster-calendar-team">
                          {slot.teamName}
                        </div>
                      ) : null}
                      {teamKarkuns.map(karkun => (
                        <PersonRow
                          key={karkun.karkunId}
                          name={karkun.name ?? ''}
                          member
                          off={karkun.off}
                          showAction={editable}
                          onAction={
                            canEditDay
                              ? () => {
                                  const absent = absentKarkunIds.filter(
                                    id => id !== karkun.karkunId
                                  );
                                  onChangeOverride(
                                    slot.shiftId as string,
                                    day.date,
                                    addedKarkunIds.filter(id => id !== karkun.karkunId),
                                    karkun.off ? absent : [...absent, karkun.karkunId]
                                  );
                                }
                              : undefined
                          }
                        />
                      ))}
                      {addedKarkuns.map(karkun => (
                        <PersonRow
                          key={karkun.karkunId}
                          name={karkun.name ?? ''}
                          member={false}
                          off={false}
                          showAction={editable}
                          onAction={
                            canEditDay
                              ? () =>
                                  onChangeOverride(
                                    slot.shiftId as string,
                                    day.date,
                                    addedKarkunIds.filter(id => id !== karkun.karkunId),
                                    absentKarkunIds
                                  )
                              : undefined
                          }
                        />
                      ))}
                      {teamKarkuns.length === 0 && addedKarkuns.length === 0 ? (
                        <div className="duty-roster-muted">None</div>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeekView;
