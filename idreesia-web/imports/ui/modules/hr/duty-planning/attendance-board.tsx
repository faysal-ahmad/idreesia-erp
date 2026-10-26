import React from 'react';
import dayjs from 'dayjs';
import { Dropdown, Spin } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

import { PersonName } from '/imports/ui/modules/helpers/controls';
import type { DutyPlanDaysQuery } from 'meteor/idreesia-common/types/client-operations';

import { todayInKarachi } from './dates';

type DaysResult = NonNullable<DutyPlanDaysQuery['dutyPlanDays']>;
type DayCard = NonNullable<NonNullable<DaysResult['days']>[number]> & {
  date: string;
};

export type AttendanceStatus = 'present' | 'late' | 'absent';

interface AttendanceBoardProps {
  columns: number;
  showImages: boolean;
  loading: boolean;
  days: DayCard[];
  savingKey?: string;
  onChangeStatus: (
    shiftId: string,
    date: string,
    karkunId: string,
    status: AttendanceStatus | null
  ) => void;
}

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
};

const STATUS_MARK: Record<AttendanceStatus, string> = {
  present: 'P',
  late: 'L',
  absent: 'A',
};

export const asStatus = (value?: string | null): AttendanceStatus | null =>
  value === 'present' || value === 'late' || value === 'absent' ? value : null;

export const AttendanceMark = ({
  status,
  editable,
  saving = false,
  onChange,
}: {
  status: AttendanceStatus | null;
  editable: boolean;
  saving?: boolean;
  onChange?: (status: AttendanceStatus | null) => void;
}) => {
  const label = status ? STATUS_LABEL[status] : 'Not set';
  const mark = (
    <span className={`duty-attendance-mark is-${status ?? 'unset'}`} aria-hidden>
      {status ? STATUS_MARK[status] : '—'}
    </span>
  );

  if (!editable) {
    return (
      <span className="duty-attendance-mark-button" title={label} aria-label={label}>
        {mark}
      </span>
    );
  }

  return (
    <Dropdown
      trigger={['click']}
      disabled={saving}
      menu={{
        items: [
          { key: 'present', label: 'Present' },
          { key: 'late', label: 'Late' },
          { key: 'absent', label: 'Absent' },
          ...(status ? [{ key: 'clear', label: 'Clear' }] : []),
        ],
        onClick: ({ key }) => {
          const next = key === 'clear' ? null : asStatus(key);
          if (next === status) return;
          onChange?.(next);
        },
      }}
    >
      <button
        type="button"
        className="duty-attendance-mark-button"
        title={label}
        aria-label={label}
        disabled={saving}
      >
        {mark}
      </button>
    </Dropdown>
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
  status,
  showStatus,
  editable,
  saving,
  onChangeStatus,
}: {
  karkunId: string;
  name: string;
  imageId?: string | null;
  imageThumbnailId?: string | null;
  member: boolean;
  off: boolean;
  showImage: boolean;
  status: AttendanceStatus | null;
  showStatus: boolean;
  editable: boolean;
  saving: boolean;
  onChangeStatus?: (status: AttendanceStatus | null) => void;
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
    {showStatus ? (
      <AttendanceMark
        status={status}
        editable={editable}
        saving={saving}
        onChange={next => onChangeStatus?.(next)}
      />
    ) : (
      <span className="duty-attendance-mark-button" />
    )}
  </div>
);

const AttendanceBoard = ({
  columns,
  showImages,
  loading,
  days,
  savingKey,
  onChangeStatus,
}: AttendanceBoardProps) => {
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
          {days.map(day => {
            const showStatus = day.date <= today;
            const editable = day.date === today;
            return (
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
                  const shiftId = slot.shiftId;
                  const teamKarkuns = (slot.teamKarkuns ?? []).flatMap(karkun =>
                    karkun?.karkunId
                      ? [
                          {
                            karkunId: karkun.karkunId,
                            name: karkun.name ?? '',
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
                            name: karkun.name ?? '',
                            imageId: karkun.imageId,
                            imageThumbnailId: karkun.imageThumbnailId,
                            attendance: asStatus(karkun.attendance),
                          },
                        ]
                      : []
                  );
                  return (
                    <div key={shiftId} className="duty-roster-calendar-shift">
                      <div className="duty-roster-calendar-shift-name">
                        <span>{slot.shiftName}</span>
                      </div>
                      {slot.teamName ? (
                        <div className="duty-roster-calendar-team">{slot.teamName}</div>
                      ) : null}
                      {teamKarkuns.map(karkun => (
                        <PersonRow
                          key={karkun.karkunId}
                          karkunId={karkun.karkunId}
                          name={karkun.name}
                          imageId={karkun.imageId}
                          imageThumbnailId={karkun.imageThumbnailId}
                          member
                          off={karkun.off}
                          showImage={showImages}
                          status={karkun.attendance}
                          showStatus={showStatus}
                          editable={editable}
                          saving={
                            savingKey === `${day.date}:${shiftId}:${karkun.karkunId}`
                          }
                          onChangeStatus={status =>
                            onChangeStatus(shiftId, day.date, karkun.karkunId, status)
                          }
                        />
                      ))}
                      {addedKarkuns.map(karkun => (
                        <PersonRow
                          key={karkun.karkunId}
                          karkunId={karkun.karkunId}
                          name={karkun.name}
                          imageId={karkun.imageId}
                          imageThumbnailId={karkun.imageThumbnailId}
                          member={false}
                          off={false}
                          showImage={showImages}
                          status={karkun.attendance}
                          showStatus={showStatus}
                          editable={editable}
                          saving={
                            savingKey === `${day.date}:${shiftId}:${karkun.karkunId}`
                          }
                          onChangeStatus={status =>
                            onChangeStatus(shiftId, day.date, karkun.karkunId, status)
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttendanceBoard;
