import React from 'react';
import dayjs from 'dayjs';
import { Button, Dropdown, Spin } from 'antd';
import { CheckOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons';

import { PersonName } from '/imports/ui/modules/helpers/controls';

import type { DutyPlanDaysQuery } from 'meteor/idreesia-common/types/client-operations';

import { AttendanceMark, asStatus } from '../attendance-board';
import { todayInKarachi } from '../dates';

type DaysResult = NonNullable<DutyPlanDaysQuery['dutyPlanDays']>;
type DayCard = NonNullable<NonNullable<DaysResult['days']>[number]> & {
  date: string;
};

interface WeekViewProps {
  columns: number;
  showImages: boolean;
  loading: boolean;
  days: DayCard[];
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
  karkunId,
  name,
  imageId,
  imageThumbnailId,
  member,
  off,
  showImage,
  showAction,
  showAttendance,
  attendance,
  onAction,
}: {
  karkunId: string;
  name: string;
  imageId?: string | null;
  imageThumbnailId?: string | null;
  member: boolean;
  off: boolean;
  showImage: boolean;
  showAction: boolean;
  showAttendance: boolean;
  attendance: ReturnType<typeof asStatus>;
  onAction?: () => void;
}) => (
  <div
    className={`duty-roster-calendar-person${
      member ? ' duty-roster-calendar-team-member' : ''
    }${off ? ' is-off' : ''}${showImage ? ' has-photo' : ''}`}
  >
    <span className="duty-roster-calendar-person-name">
      {member && off ? (
        <CloseOutlined className="duty-roster-off-mark" aria-hidden />
      ) : null}
      {showImage ? (
        <PersonName
          person={{
            _id: karkunId,
            name,
            imageId,
            imageThumbnailId,
          }}
        />
      ) : (
        name
      )}
    </span>
    {showAttendance ? (
      <AttendanceMark status={attendance} editable={false} />
    ) : (
      showAction && <PersonAction name={name} restore={off} onClick={onAction} />
    )}
  </div>
);

const WeekView = ({
  columns,
  showImages,
  loading,
  days,
  onSetTeam,
  onAddKarkun,
  onChangeOverride,
}: WeekViewProps) => {
  const today = todayInKarachi();

  return (
    <div className="duty-roster-day">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Spin />
        </div>
      ) : (
        <div
          className="duty-roster-days-board"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(140px, 1fr))` }}
        >
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
              {(day.slots ?? []).map(slot => {
                if (!slot?.shiftId) return null;
                const teamKarkuns = (slot.teamKarkuns ?? []).flatMap(karkun =>
                  karkun?.karkunId
                    ? [
                        {
                          karkunId: karkun.karkunId,
                          name: karkun.name,
                          off: !!karkun.off,
                          imageId: karkun.imageId,
                          imageThumbnailId: karkun.imageThumbnailId,
                          attendance: asStatus(karkun.attendance),
                        },
                      ]
                    : []
                );
                const addedKarkuns = (slot.addedKarkuns ?? []).flatMap(karkun =>
                  karkun?.karkunId
                    ? [
                        {
                          karkunId: karkun.karkunId,
                          name: karkun.name,
                          imageId: karkun.imageId,
                          imageThumbnailId: karkun.imageThumbnailId,
                          attendance: asStatus(karkun.attendance),
                        },
                      ]
                    : []
                );
                // Today and earlier are locked: only attendance can change.
                const locked = !!day.locked;
                const addedKarkunIds = idsOf(slot.addedKarkunIds);
                const absentKarkunIds = idsOf(slot.absentKarkunIds);
                return (
                  <div key={slot.shiftId} className="duty-roster-calendar-shift">
                    <div className="duty-roster-calendar-shift-name">
                      <span>{slot.shiftName}</span>
                      {locked ? null : (
                        <Dropdown
                          trigger={['click']}
                          menu={{
                            items: [
                              { key: 'team', label: 'Set team (from tomorrow)' },
                              { key: 'karkun', label: 'Add karkun for this day' },
                            ],
                            onClick: ({ key }) => {
                              if (key === 'team') {
                                onSetTeam({
                                  shiftId: slot.shiftId as string,
                                  shiftName: slot.shiftName ?? '',
                                });
                              }
                              if (key === 'karkun') {
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
                      )}
                    </div>
                    {slot.teamName ? (
                      <div className="duty-roster-calendar-team">
                        {slot.teamName}
                      </div>
                    ) : null}
                    {teamKarkuns.map(karkun => (
                      <PersonRow
                        key={karkun.karkunId}
                        karkunId={karkun.karkunId}
                        name={karkun.name ?? ''}
                        imageId={karkun.imageId}
                        imageThumbnailId={karkun.imageThumbnailId}
                        member
                        off={karkun.off}
                        showImage={showImages}
                        showAttendance={locked}
                        attendance={karkun.attendance}
                        showAction={!locked}
                        onAction={
                          !locked
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
                        karkunId={karkun.karkunId}
                        name={karkun.name ?? ''}
                        imageId={karkun.imageId}
                        imageThumbnailId={karkun.imageThumbnailId}
                        member={false}
                        off={false}
                        showImage={showImages}
                        showAttendance={locked}
                        attendance={karkun.attendance}
                        showAction={!locked}
                        onAction={
                          !locked
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
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WeekView;
